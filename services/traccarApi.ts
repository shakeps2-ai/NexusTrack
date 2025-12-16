import { Vehicle, VehicleStatus } from '../types';
import { MOCK_VEHICLES } from '../constants';

interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  error?: string;
}

// Serviço Mock para simular backend localmente
class ApiService {
  private vehicles: Vehicle[] = [...MOCK_VEHICLES];

  // Simula login verificando apenas se os campos estão preenchidos
  async login(url: string, email: string, pass: string): Promise<AuthResponse> {
    // Simulação de delay de rede
    await new Promise(r => setTimeout(r, 800));
    
    if (email === 'admin@empresa.com' && pass === '123456') {
        return { 
            success: true, 
            user: { id: 1, name: 'Administrador', email: 'admin@empresa.com' } 
        };
    }
    // Para fins de demonstração, aceita qualquer email válido se a senha não estiver vazia
    if (email.includes('@') && pass.length > 0) {
         return { 
            success: true, 
            user: { id: 99, name: 'Usuário Demo', email: email } 
        };
    }
    return { success: false, error: 'Credenciais inválidas' };
  }

  async register(url: string, name: string, email: string, pass: string): Promise<AuthResponse> {
      await new Promise(r => setTimeout(r, 800));
      return { success: true };
  }

  async getDevices(): Promise<Vehicle[]> {
    // Retorna a lista local (em memória)
    return Promise.resolve([...this.vehicles]);
  }

  async addDevice(vehicle: any): Promise<boolean> {
      await new Promise(r => setTimeout(r, 500));
      
      const existingIndex = this.vehicles.findIndex(v => v.id === vehicle.id);
      
      if (existingIndex >= 0) {
          // Update
          this.vehicles[existingIndex] = { ...this.vehicles[existingIndex], ...vehicle };
      } else {
          // Insert
          this.vehicles.push(vehicle);
      }
      return true;
  }
  
  async deleteDevice(id: string): Promise<boolean> {
      this.vehicles = this.vehicles.filter(v => v.id !== id);
      return true;
  }

  async toggleLock(id: string): Promise<boolean> {
      const v = this.vehicles.find(v => v.id === id);
      if (v) {
          v.isLocked = !v.isLocked;
          if (v.isLocked) v.status = VehicleStatus.STOPPED;
          return true;
      }
      return false;
  }

  // Simulação de movimento aleatório para parecer "vivo"
  simulateMovement() {
    this.vehicles = this.vehicles.map(v => {
        if (v.status === VehicleStatus.MOVING && !v.isLocked) {
            return {
                ...v,
                speed: Math.max(0, Math.min(120, v.speed + (Math.random() * 10 - 5))),
                location: {
                    lat: v.location.lat + (Math.random() * 0.002 - 0.001),
                    lng: v.location.lng + (Math.random() * 0.002 - 0.001)
                }
            };
        }
        return v;
    });
  }
}

export const traccarApi = new ApiService();