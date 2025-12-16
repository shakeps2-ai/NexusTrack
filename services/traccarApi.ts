import { Vehicle } from '../types';

// O serviço agora conecta com os Endpoints Serverless da Vercel
class ApiService {
  
  async login(url: string, email: string, pass: string) {
    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password: pass })
        });
        return await res.json();
    } catch (e) {
        return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async register(url: string, name: string, email: string, pass: string) {
    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', email, password: pass, name })
        });
        return await res.json();
    } catch (e) {
        return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  async getDevices(): Promise<Vehicle[]> {
    try {
        const res = await fetch('/api/vehicles');
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
  }

  async addDevice(vehicle: any): Promise<boolean> {
      try {
        // Envia para o backend salvar no Neon
        const res = await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...vehicle,
                lat: vehicle.location?.lat || -23.5505,
                lng: vehicle.location?.lng || -46.6333,
            })
        });
        const data = await res.json();
        return data.success;
      } catch {
          return false;
      }
  }
  
  async deleteDevice(id: string): Promise<boolean> {
      try {
        const res = await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        return res.ok;
      } catch { return false; }
  }

  async toggleLock(id: string): Promise<boolean> {
      try {
        const res = await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggleLock', id })
        });
        return res.ok;
      } catch { return false; }
  }

  // Mantido para compatibilidade, mas agora apenas retorna o objeto
  mapToVehicle(data: any): Vehicle {
     return data;
  }
}

export const traccarApi = new ApiService();