
import { Vehicle, VehicleStatus } from '../types';
import { supabase } from './supabaseClient';
import { MOCK_VEHICLES } from '../constants';

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  error?: string;
}

const formatVehicle = (v: any): Vehicle => ({
    id: v.id,
    plate: v.plate,
    model: v.model,
    trackerId: v.tracker_id,
    driverId: v.driver_id,
    status: v.status as VehicleStatus,
    speed: v.speed || 0,
    fuelLevel: v.fuel_level || 0,
    ignition: v.ignition || false,
    isLocked: v.is_locked || false,
    geofenceActive: v.geofence_active || false,
    geofenceRadius: v.geofence_radius || 1000,
    location: v.location || { lat: -23.55, lng: -46.63 },
    lastUpdate: v.last_update,
    updateInterval: v.update_interval || 0,
    odometer: v.odometer || 0
});

class ApiService {
  private isSimulationEnabled: boolean = false;

  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('vehicles').select('id', { count: 'exact', head: true });
      return !error;
    } catch (e) {
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single();

        return {
            success: true,
            user: {
                id: session.user.id,
                email: session.user.email || '',
                name: profile?.full_name || 'Administrador',
                role: profile?.role || 'user'
            }
        };
    }
    return { success: false };
  }

  async login(email: string, pass: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: 'Credenciais inválidas.' };

    if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        return { 
            success: true, 
            user: { 
                id: data.user.id, 
                name: profile?.full_name || 'Usuário', 
                email: data.user.email || '',
                role: profile?.role || 'user'
            } 
        };
    }
    return { success: false, error: 'Erro ao processar login.' };
  }

  // Fix: Added register method to handle user creation in Auth and Profiles
  async register(name: string, email: string, pass: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name } }
    });

    if (error) return { success: false, error: error.message };

    if (data.user) {
        await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name,
            role: 'user',
            updated_at: new Date().toISOString()
        });
        
        return { 
            success: true, 
            user: { 
                id: data.user.id, 
                name: name, 
                email: data.user.email || '',
                role: 'user'
            } 
        };
    }
    return { success: false, error: 'Erro ao registrar.' };
  }

  async createDefaultAdmin(): Promise<AuthResponse> {
      const email = 'admin@nexustrack.com';
      const password = 'admin123';
      const name = 'Admin Master';

      // 1. SignUp no Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });

      if (error && !error.message.includes('already registered')) {
          return { success: false, error: error.message };
      }

      // 2. Garantir Perfil Admin na tabela pública
      const userId = data.user?.id || (await supabase.auth.signInWithPassword({email, password})).data.user?.id;
      
      if (userId) {
          await supabase.from('profiles').upsert({
              id: userId,
              full_name: name,
              role: 'admin',
              updated_at: new Date().toISOString()
          });
      }

      return this.login(email, password);
  }

  async logout(): Promise<void> {
      await supabase.auth.signOut();
  }

  // --- TRACCAR SYNC LOGIC ---
  async syncWithTraccar(config: any): Promise<boolean> {
      // Aqui simulamos a chamada para um servidor Traccar Real
      // Em uma implementação de produção, usaríamos fetch() na API do Traccar
      console.log("Sincronizando com servidor Traccar:", config.url);
      
      // Simulando recebimento de dispositivos do Traccar
      const traccarDevices = [
          { uniqueId: 'TK103-9988', name: 'Caminhão 01', status: 'online', lastUpdate: new Date().toISOString() },
          { uniqueId: 'GT06-5522', name: 'Van Entrega', status: 'offline', lastUpdate: new Date().toISOString() }
      ];

      for (const dev of traccarDevices) {
          await this.addDevice({
              id: `traccar-${dev.uniqueId}`,
              plate: dev.uniqueId,
              model: dev.name,
              trackerId: dev.uniqueId,
              status: dev.status === 'online' ? VehicleStatus.MOVING : VehicleStatus.OFFLINE,
              speed: 0,
              location: { lat: -23.55, lng: -46.63 },
              fuelLevel: 100,
              ignition: false,
              isLocked: false,
              geofenceActive: false,
              geofenceRadius: 1000,
              odometer: 0,
              updateInterval: 5
          });
      }
      return true;
  }

  async getDevices(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
        return [];
    }
    return data.map(formatVehicle);
  }

  subscribeToUpdates(onUpdate: (payload: any) => void) {
      return supabase.channel('vehicles_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
             const formattedNew = payload.new && Object.keys(payload.new).length > 0 ? formatVehicle(payload.new) : null;
             onUpdate({ eventType: payload.eventType, new: formattedNew, old: payload.old });
          })
        .subscribe();
  }

  async addDevice(vehicle: any): Promise<boolean> {
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
      const { data: vehicle } = await supabase.from('vehicles').select('is_locked').eq('id', id).single();
      if (vehicle) {
          const newLockState = !vehicle.is_locked;
          await supabase.from('vehicles').update({ 
              is_locked: newLockState,
              status: newLockState ? VehicleStatus.STOPPED : VehicleStatus.MOVING,
              speed: 0
          }).eq('id', id);
          return true;
      }
      return false;
  }

  async sendTestPing(id: string): Promise<boolean> {
      const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', id).single();
      if (!vehicle) return false;
      const updates = {
          last_update: new Date().toLocaleTimeString(),
          location: { 
            lat: (vehicle.location?.lat || -23.55) + (Math.random() * 0.002 - 0.001), 
            lng: (vehicle.location?.lng || -46.63) + (Math.random() * 0.002 - 0.001) 
          },
          status: vehicle.is_locked ? VehicleStatus.STOPPED : VehicleStatus.MOVING,
          speed: vehicle.is_locked ? 0 : Math.round(Math.random() * 80 + 20)
      };
      const { error } = await supabase.from('vehicles').update(updates).eq('id', id);
      return !error;
  }

  setSimulationMode(enabled: boolean) { this.isSimulationEnabled = enabled; }
  getSimulationMode(): boolean { return this.isSimulationEnabled; }

  async simulateMovement() {
    if (!this.isSimulationEnabled) return;
    const { data: vehicles } = await supabase.from('vehicles').select('*').eq('is_locked', false);
    if (!vehicles) return;

    const updates = vehicles.map((v: any) => ({
        id: v.id,
        speed: Math.round(Math.random() * 60 + 20),
        location: {
            lat: (v.location?.lat || -23.55) + (Math.random() * 0.0004 - 0.0002),
            lng: (v.location?.lng || -46.63) + (Math.random() * 0.0004 - 0.0002)
        },
        last_update: new Date().toLocaleTimeString()
    }));

    if (updates.length > 0) await supabase.from('vehicles').upsert(updates);
  }
}

export const traccarApi = new ApiService();
