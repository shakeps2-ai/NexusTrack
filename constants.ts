
import { Vehicle, Driver, VehicleStatus, Alert, AlertType } from './types';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Carlos Silva',
    license: '123456789',
    avatar: 'https://picsum.photos/100/100?random=1',
    phone: '(11) 99999-1001',
    status: 'active',
    rating: 4.8
  },
  {
    id: 'd2',
    name: 'Fernanda Oliveira',
    license: '987654321',
    avatar: 'https://picsum.photos/100/100?random=2',
    phone: '(11) 99999-1002',
    status: 'active',
    rating: 5.0
  },
  {
    id: 'd3',
    name: 'Roberto Santos',
    license: '456123789',
    avatar: 'https://picsum.photos/100/100?random=3',
    phone: '(11) 99999-1003',
    status: 'inactive',
    rating: 4.5
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    plate: 'ABC-1234',
    model: 'Fiat Fiorino 2023',
    trackerId: 'IMEI-8829102938',
    driverId: 'd1',
    status: VehicleStatus.MOVING,
    speed: 45,
    fuelLevel: 78,
    ignition: true,
    isLocked: false,
    geofenceActive: true,
    geofenceRadius: 1000,
    location: { lat: 30, lng: 40 },
    lastUpdate: 'Há 2 min',
    updateInterval: 0,
    odometer: 12450.5
  },
  {
    id: 'v2',
    plate: 'XYZ-9876',
    model: 'Renault Master',
    trackerId: 'IMEI-1102938475',
    driverId: 'd2',
    status: VehicleStatus.STOPPED,
    speed: 0,
    fuelLevel: 45,
    ignition: false,
    isLocked: false,
    geofenceActive: false,
    geofenceRadius: 500,
    location: { lat: 60, lng: 20 },
    lastUpdate: 'Há 15 min',
    updateInterval: 60,
    odometer: 85300.2
  },
  {
    id: 'v3',
    plate: 'DEF-5566',
    model: 'VW Constellation',
    trackerId: 'GT06-55992211',
    status: VehicleStatus.OFFLINE,
    speed: 0,
    fuelLevel: 90,
    ignition: false,
    isLocked: true, // Veículo bloqueado
    geofenceActive: true,
    geofenceRadius: 5000,
    location: { lat: 80, lng: 80 },
    lastUpdate: 'Há 4 horas',
    updateInterval: 300,
    odometer: 210450.0
  },
  {
    id: 'v4',
    plate: 'GHI-7788',
    model: 'Mercedes Sprinter',
    trackerId: 'TK303-99887766',
    driverId: 'd3',
    status: VehicleStatus.MOVING,
    speed: 82,
    fuelLevel: 20,
    ignition: true,
    isLocked: false,
    geofenceActive: false,
    geofenceRadius: 2000,
    location: { lat: 20, lng: 70 },
    lastUpdate: 'Há 1 min',
    updateInterval: 0,
    odometer: 45200.8
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    vehicleId: 'v4',
    type: AlertType.SPEED,
    timestamp: '10:45 AM',
    severity: 'high',
    resolved: false
  },
  {
    id: 'a2',
    vehicleId: 'v2',
    type: AlertType.MAINTENANCE,
    timestamp: '08:00 AM',
    severity: 'medium',
    resolved: true
  }
];
