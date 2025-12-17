
import { Vehicle, VehicleStatus } from '../types';
import { supabase } from './supabaseClient';
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

// Serviço Real conectado ao Supabase
class ApiService {
  
  // Verifica se a conexão com o banco de dados está ativa
  async checkConnection(): Promise<boolean> {
    try {
      const { count, error } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
      return !error;
    } catch (e) {
      return false;
    }
  }

  // Simula login (Mantido local por enquanto, idealmente migraria para Supabase Auth)
  async login(url: string, email: string, pass: string): Promise<AuthResponse> {
    // Verifica conexão antes de "logar"
    const isConnected = await this.checkConnection();
    if (!isConnected) {
        return { success: false, error: 'Erro de conexão com o Banco de Dados' };
    }

    await new Promise(r => setTimeout(r, 800));
    
    if (email === 'admin@empresa.com' && pass === '123456') {
        return { 
            success: true, 
            user: { id: 1, name: 'Administrador', email: 'admin@empresa.com' } 
        };
    }
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

  // Busca dispositivos do Supabase
  async getDevices(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase.from('vehicles').select('*');
      
      if (error) {
        console.error('Erro ao buscar veículos:', error);
        return [];
      }

      // Se o banco estiver vazio, popula com dados de teste
      if (!data || data.length === 0) {
        await this.seedDatabase();
        return [...MOCK_VEHICLES];
      }

      // Mapeia do formato do banco (snake_case) para o App (camelCase)
      return data.map((v: any) => ({
        id: v.id,
        plate: v.plate,
        model: v.model,
        trackerId: v.tracker_id,
        driverId: v.driver_id,
        status: v.status as VehicleStatus,
        speed: v.speed,
        fuelLevel: v.fuel_level,
        ignition: v.ignition,
        isLocked: v.is_locked,
        geofenceActive: v.geofence_active,
        geofenceRadius: v.geofence_radius,
        location: v.location, // JSONB {lat, lng}
        lastUpdate: v.last_update,
        updateInterval: v.update_interval,
        odometer: v.odometer
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  // Popula o banco na primeira execução
  async seedDatabase() {
     const dbVehicles = MOCK_VEHICLES.map(v => ({
        id: v.id,
        plate: v.plate,
        model: v.model,
        tracker_id: v.trackerId,
        driver_id: v.driverId,
        status: v.status,
        speed: v.speed,
        fuel_level: v.fuelLevel,
        ignition: v.ignition,
        is_locked: v.isLocked,
        geofence_active: v.geofenceActive,
        geofence_radius: v.geofenceRadius,
        location: v.location,
        last_update: new Date().toLocaleString('pt-BR'),
        update_interval: v.updateInterval,
        odometer: v.odometer
     }));
     
     await supabase.from('vehicles').insert(dbVehicles);
  }

  async addDevice(vehicle: any): Promise<boolean> {
      // Prepara objeto para o formato do banco
      const dbVehicle = {
        id: vehicle.id,
        plate: vehicle.plate,
        model: vehicle.model,
        tracker_id: vehicle.trackerId,
        driver_id: vehicle.driverId,
        status: vehicle.status,
        speed: vehicle.speed,
        fuel_level: vehicle.fuelLevel,
        ignition: vehicle.ignition,
        is_locked: vehicle.isLocked,
        geofence_active: vehicle.geofenceActive,
        geofence_radius: vehicle.geofenceRadius,
        location: vehicle.location,
        last_update: new Date().toLocaleString('pt-BR'),
        update_interval: vehicle.updateInterval,
        odometer: vehicle.odometer
      };

      const { error } = await supabase.from('vehicles').upsert(dbVehicle);
      return !error;
  }
  
  async deleteDevice(id: string): Promise<boolean> {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      return !error;
  }

  async toggleLock(id: string): Promise<boolean> {
      // Primeiro busca o estado atual
      const { data: vehicle } = await supabase.from('vehicles').select('is_locked').eq('id', id).single();
      
      if (vehicle) {
          const newLockState = !vehicle.is_locked;
          const updates: any = { is_locked: newLockState };
          
          if (newLockState) {
              updates.status = VehicleStatus.STOPPED;
              updates.speed = 0;
              updates.ignition = false;
          }

          await supabase.from('vehicles').update(updates).eq('id', id);
          return true;
      }
      return false;
  }

  // Simulação: Calcula novas posições no frontend e SALVA no banco
  // Isso permite que múltiplos clientes vendo o painel vejam o movimento em tempo real
  async simulateMovement() {
    const { data: vehicles } = await supabase.from('vehicles').select('*').eq('is_locked', false);
    
    if (!vehicles) return;

    const updates = vehicles
        .filter((v: any) => v.status === 'Em Movimento') // Filtra apenas status string exata ou enum
        .map((v: any) => {
            // Lógica de movimento
            let variation = (Math.random() * 6 - 3); 
            let newSpeed = Math.max(0, Math.min(160, Math.round(v.speed + variation)));
            
            if (newSpeed < 5) newSpeed = 10;

            const distanceTraveledKm = (newSpeed * 2) / 3600;
            const newOdometer = (v.odometer || 0) + distanceTraveledKm;

            const newLocation = {
                lat: (v.location?.lat || -23.55) + (Math.random() * 0.001 - 0.0005),
                lng: (v.location?.lng || -46.63) + (Math.random() * 0.001 - 0.0005)
            };

            return {
                id: v.id,
                speed: newSpeed,
                odometer: newOdometer,
                location: newLocation,
                last_update: new Date().toLocaleString('pt-BR')
            };
        });

    if (updates.length > 0) {
        // Envia atualizações em lote (Bulk Upsert)
        await supabase.from('vehicles').upsert(updates);
    }
  }
}

export const traccarApi = new ApiService();
