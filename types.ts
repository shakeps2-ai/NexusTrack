
export enum VehicleStatus {
  MOVING = 'Em Movimento',
  STOPPED = 'Parado',
  OFFLINE = 'Offline',
  maintenance = 'Manutenção'
}

export enum AlertType {
  SPEED = 'Excesso de Velocidade',
  GEOFENCE = 'Cerca Virtual',
  MAINTENANCE = 'Manutenção Preventiva',
  SOS = 'Botão de Pânico'
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  avatar: string;
  phone: string;
  status: 'active' | 'inactive';
  rating: number; // 0-5
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  trackerId?: string; // ID do Rastreador (IMEI, Serial, etc.)
  driverId?: string; // Assigned driver
  status: VehicleStatus;
  speed: number; // km/h
  fuelLevel: number; // percentage
  ignition: boolean; // true = on, false = off
  isLocked: boolean; // true = blocked (cut fuel/ignition)
  geofenceActive: boolean;
  geofenceRadius: number; // in meters
  location: {
    lat: number;
    lng: number;
  };
  lastUpdate: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: AlertType;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

export type ViewState = 'dashboard' | 'map' | 'fleet' | 'employees' | 'analytics' | 'notifications';