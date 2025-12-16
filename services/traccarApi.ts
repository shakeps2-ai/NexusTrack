import { Vehicle, VehicleStatus } from '../types';

export interface TraccarConfig {
  serverUrl: string;
  token?: string;
}

export type LoginResult = {
    success: boolean;
    error?: 'NETWORK_ERROR' | 'INVALID_CREDENTIALS' | 'SERVER_ERROR' | 'UNKNOWN';
    details?: string;
};

class TraccarService {
  private socket: WebSocket | null = null;
  private config: TraccarConfig = { serverUrl: '' };
  private onUpdateCallback: ((data: any) => void) | null = null;

  // Helper para montar URLs da API corretamente
  private getApiUrl(path: string): string {
    const base = this.config.serverUrl.replace(/\/$/, "");
    const endpoint = path.startsWith('/') ? path : `/${path}`;
    return base ? `${base}${endpoint}` : endpoint;
  }

  // Verificar conectividade básica com o servidor
  async checkConnection(url: string): Promise<boolean> {
      const oldUrl = this.config.serverUrl;
      this.config.serverUrl = url;
      
      try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          // Tenta acessar um endpoint público ou leve
          await fetch(this.getApiUrl('/api/server'), {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          this.config.serverUrl = oldUrl; 
          return true; // Se respondeu (mesmo 401), está online
      } catch (error) {
          console.warn("Connection Check Failed:", error);
          this.config.serverUrl = oldUrl;
          return false;
      }
  }

  // Autenticação
  async login(url: string, email: string, pass: string): Promise<LoginResult> {
    if (url === '') {
        this.config.serverUrl = ''; 
    } else {
        const cleanUrl = url.replace(/\/$/, "");
        this.config.serverUrl = cleanUrl;
    }

    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', pass);

    const endpoint = this.getApiUrl('/api/session');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params,
        credentials: 'include' // Essencial para cookies de sessão
      });

      if (response.ok) {
        return { success: true };
      }
      
      if (response.status === 401) {
          return { success: false, error: 'INVALID_CREDENTIALS' };
      }
      
      if (response.status >= 500) {
          return { success: false, error: 'SERVER_ERROR', details: `Erro interno ${response.status}` };
      }

      return { success: false, error: 'UNKNOWN', details: response.statusText };

    } catch (error: any) {
      console.error("Traccar Login Error:", error);
      return { success: false, error: 'NETWORK_ERROR', details: error.message };
    }
  }

  // Registrar novo usuário
  async register(url: string, name: string, email: string, pass: string): Promise<LoginResult> {
     if (url === '') {
        this.config.serverUrl = '';
    } else {
        const cleanUrl = url.replace(/\/$/, "");
        this.config.serverUrl = cleanUrl;
    }

    const endpoint = this.getApiUrl('/api/users');

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: pass
            })
        });

        if (response.ok) {
            return { success: true };
        }
        
        const text = await response.text();
        
        if (response.status === 400) {
             if (text.includes('Unique index') || text.includes('already exists')) {
                 return { success: false, error: 'UNKNOWN', details: 'Email já cadastrado.' };
             }
        }

        return { success: false, error: 'SERVER_ERROR', details: text };
    } catch (error: any) {
        console.error("Traccar Register Error:", error);
        return { success: false, error: 'NETWORK_ERROR', details: error.message };
    }
  }

  // Métodos de Dados (Dispositivos, Posições, etc)
  
  async getDevices(): Promise<any[]> {
    try {
      const response = await fetch(this.getApiUrl('/api/devices'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Falha ao buscar dispositivos');
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addDevice(deviceData: { name: string; uniqueId: string; model?: string }): Promise<any | null> {
    try {
      const response = await fetch(this.getApiUrl('/api/devices'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: deviceData.name,
          uniqueId: deviceData.uniqueId,
          model: deviceData.model
        }),
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Falha ao adicionar dispositivo:', await response.text());
        return null;
      }
    } catch (error) {
      console.error("Add Device Error:", error);
      return null;
    }
  }

  async getPositions(): Promise<any[]> {
    try {
      const response = await fetch(this.getApiUrl('/api/positions'), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Falha ao buscar posições');
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async sendCommand(deviceId: number, type: 'engineStop' | 'engineResume'): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('/api/commands/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: deviceId,
          type: type
        }),
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      console.error("Command Error:", error);
      return false;
    }
  }

  // WebSocket
  connectSocket(onUpdate: (data: any) => void) {
    this.onUpdateCallback = onUpdate;
    
    // Se a config tiver uma URL definida (inserida pelo usuário), usa ela.
    // Caso contrário, usa a origem da janela (útil se estiver rodando local com proxy)
    let baseUrl = this.config.serverUrl || window.location.origin;
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    // Detecta protocolo correto baseado na URL base (http -> ws, https -> wss)
    const isSecure = baseUrl.startsWith('https') || (baseUrl === window.location.origin && window.location.protocol === 'https:');
    const protocol = isSecure ? 'wss' : 'ws';
    
    // Remove o protocolo http/https da string para montar o do socket
    const host = baseUrl.replace(/^https?:\/\//, '');
    const socketUrl = `${protocol}://${host}/api/socket`;

    if (this.socket) {
        this.socket.close();
    }

    try {
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = () => console.log('Traccar WebSocket Connected');
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.onUpdateCallback) this.onUpdateCallback(data);
          } catch (e) {
            console.error('Socket Parse Error', e);
          }
        };

        this.socket.onclose = (event) => {
          console.log('Socket Disconnected. Retry in 5s...');
          setTimeout(() => this.connectSocket(onUpdate), 5000);
        };
    } catch (e) {
        console.error("Falha ao criar WebSocket:", e);
    }
  }

  // Mapper
  mapToVehicle(traccarDevice: any, traccarPosition?: any): Vehicle {
    let status = VehicleStatus.OFFLINE;
    
    // Lógica de Status Baseada no Traccar
    if (traccarDevice.status === 'online') {
        status = traccarPosition && traccarPosition.speed > 0 ? VehicleStatus.MOVING : VehicleStatus.STOPPED;
    } else if (traccarDevice.status === 'unknown') {
        status = VehicleStatus.OFFLINE;
    } else if (traccarDevice.status === 'offline') {
        status = VehicleStatus.OFFLINE;
    }

    // Atributos Seguros
    const attr = traccarPosition?.attributes || {};
    const devAttr = traccarDevice.attributes || {};

    const ignition = attr.ignition ?? false;
    const fuel = attr.fuel ?? attr.fuelLevel ?? 50; 
    const blocked = attr.blocked ?? false;
    
    const lastUpdateDate = traccarPosition?.fixTime ? new Date(traccarPosition.fixTime) : new Date();
    const timeDiff = Math.floor((new Date().getTime() - lastUpdateDate.getTime()) / 60000); 
    const lastUpdateStr = timeDiff < 1 ? 'Agora' : timeDiff > 1440 ? `${Math.floor(timeDiff/1440)} dias` : `${Math.floor(timeDiff/60)}h ${timeDiff%60}m`;

    return {
      id: String(traccarDevice.id),
      plate: traccarDevice.name,
      model: traccarDevice.model || devAttr.model || 'Desconhecido',
      trackerId: traccarDevice.uniqueId,
      status: status,
      speed: Math.round((traccarPosition?.speed || 0) * 1.852), 
      fuelLevel: Math.round(fuel),
      ignition: ignition,
      isLocked: blocked,
      geofenceActive: false, // Geofence é complexo via API, mantendo local por enquanto
      geofenceRadius: 1000,
      location: {
        lat: traccarPosition?.latitude || 0,
        lng: traccarPosition?.longitude || 0
      },
      lastUpdate: lastUpdateStr
    };
  }
}

export const traccarApi = new TraccarService();