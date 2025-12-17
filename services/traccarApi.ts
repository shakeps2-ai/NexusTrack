
import { Vehicle, VehicleStatus } from '../types';
import { MOCK_VEHICLES } from '../constants';

export interface AuthResponse {
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
          // Update: Mantém dados que não vieram no payload (merge seguro)
          this.vehicles[existingIndex] = { 
              ...this.vehicles[existingIndex], 
              ...vehicle,
              // Garante que se o status for PARADO, a velocidade zera
              speed: vehicle.status === VehicleStatus.STOPPED || vehicle.status === VehicleStatus.OFFLINE ? 0 : vehicle.speed
          };
      } else {
          // Insert
          this.vehicles.push({
              ...vehicle,
              odometer: Number(vehicle.odometer) || 0,
              speed: vehicle.status === VehicleStatus.MOVING ? (vehicle.speed || 30) : 0,
              location: vehicle.location || { lat: -23.5505, lng: -46.6333 }
          });
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
          if (v.isLocked) {
              v.status = VehicleStatus.STOPPED;
              v.speed = 0;
              v.ignition = false;
          }
          return true;
      }
      return false;
  }

  // Simulação de movimento aleatório para parecer "vivo"
  simulateMovement() {
    this.vehicles = this.vehicles.map(v => {
        if (v.status === VehicleStatus.MOVING && !v.isLocked) {
            // Nova velocidade com variação suave, arredondada para inteiro
            let variation = (Math.random() * 6 - 3); // Varia entre -3 e +3 km/h
            let newSpeed = v.speed + variation;
            
            // Limites de velocidade (0 a 160 km/h)
            newSpeed = Math.max(0, Math.min(160, Math.round(newSpeed)));
            
            // Se velocidade for muito baixa mas status for movendo, mantém um mínimo ou para
            if (newSpeed < 5) newSpeed = 10;

            // Calcular distância percorrida no intervalo (assumindo ~2s de intervalo de atualização)
            // Distância (km) = Velocidade (km/h) * (Tempo (s) / 3600)
            const distanceTraveledKm = (newSpeed * 2) / 3600;

            return {
                ...v,
                speed: Math.round(newSpeed), // Força inteiro
                odometer: v.odometer + distanceTraveledKm, // Acumula odômetro
                location: {
                    lat: v.location.lat + (Math.random() * 0.001 - 0.0005),
                    lng: v.location.lng + (Math.random() * 0.001 - 0.0005)
                }
            };
        } else {
            // Se não está movendo, garante velocidade 0
            return {
                ...v,
                speed: 0
            };
        }
        return v;
    });
  }
}

export const traccarApi = new ApiService();
