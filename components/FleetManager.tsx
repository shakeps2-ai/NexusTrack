
import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, VehicleStatus, Driver } from '../types';
import { 
    Search, Plus, Battery, Signal, X, Wrench, Calendar, User, MapPin, 
    Edit, Trash2, CheckCircle, Radio, Lock, Unlock, Shield, 
    Loader2, Gauge, Clock, Activity, Navigation,
    Wifi, Key, Siren, MousePointer2, AlertOctagon, Copy, History, Truck, Link as LinkIcon, Server, RefreshCw, Code, Database, Globe
} from 'lucide-react';
import { traccarApi } from '../services/traccarApi';

interface FleetManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateGeofence: (id: string, active: boolean, radius: number) => void;
  initialAction?: string | null;
  onClearAction?: () => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({ 
    vehicles, drivers, onAddVehicle, onUpdateVehicle, onDeleteVehicle, onToggleLock, onUpdateGeofence,
    initialAction, onClearAction
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'alert'} | null>(null);

  // Traccar Config State
  const [showTraccarConfig, setShowTraccarConfig] = useState(false);
  const [traccarForm, setTraccarForm] = useState({ url: 'http://demo.traccar.org', user: '', pass: '' });
  const [isSyncing, setIsSyncing] = useState(false);

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectVehicle, setConnectVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: '', model: '', trackerId: '', driverId: '', 
    status: VehicleStatus.STOPPED, fuelLevel: 50, updateInterval: 0, odometer: 0
  });

  const handleTraccarSync = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSyncing(true);
      const success = await traccarApi.syncWithTraccar(traccarForm);
      setIsSyncing(false);
      if (success) {
          setToast({ msg: 'Dispositivos Traccar sincronizados!', type: 'success' });
          setShowTraccarConfig(false);
      } else {
          setToast({ msg: 'Erro ao conectar com Traccar.', type: 'alert' });
      }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        trackerId: formData.trackerId,
        driverId: formData.driverId || undefined,
        status: formData.status as VehicleStatus,
        fuelLevel: Number(formData.fuelLevel),
        speed: 0,
        location: { lat: -23.55, lng: -46.63 },
        lastUpdate: 'Agora',
        ignition: false,
        isLocked: false,
        geofenceActive: false,
        geofenceRadius: 1000,
        updateInterval: Number(formData.updateInterval),
        odometer: Number(formData.odometer)
    };
    if (editingVehicle) onUpdateVehicle({ ...editingVehicle, ...payload });
    else onAddVehicle(payload);
    setIsFormOpen(false);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      (v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || 
        (statusFilter === 'moving' && v.status === VehicleStatus.MOVING) ||
        (statusFilter === 'locked' && v.isLocked))
    );
  }, [vehicles, searchTerm, statusFilter]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-950 text-slate-200">
      {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-5">
              <div className={`px-6 py-3 rounded-xl border ${toast.type === 'success' ? 'bg-green-900/90 border-green-500' : 'bg-red-900/90 border-red-500'} backdrop-blur-md flex items-center gap-2`}>
                  <CheckCircle className="w-4 h-4" /> <span>{toast.msg}</span>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Dispositivos</h1>
           <p className="text-slate-400">Integração nativa com Traccar e Supabase.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowTraccarConfig(true)} className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 font-bold">
                <Server className="w-4 h-4 text-blue-500" /> Configurar Traccar
            </button>
            <button onClick={() => { setEditingVehicle(null); setIsFormOpen(true); }} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Novo Veículo
            </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar placa ou modelo..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-300">
                <option value="all">Todos os Status</option>
                <option value="moving">Em Movimento</option>
                <option value="locked">Bloqueados</option>
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">ID Rastreador</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Último Sinal</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredVehicles.map(vehicle => (
                <tr key={vehicle.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{vehicle.model}</div>
                    <div className="text-xs font-mono text-blue-400">{vehicle.plate}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{vehicle.trackerId || 'Sem ID'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${vehicle.isLocked ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                        {vehicle.isLocked ? 'Bloqueado' : vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{vehicle.lastUpdate || '---'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => traccarApi.sendTestPing(vehicle.id)} className="p-2 bg-slate-800 hover:bg-green-600 rounded-lg text-slate-400 hover:text-white transition-all" title="Ping Teste"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteVehicle(vehicle.id)} className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg text-slate-400 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TRACCAR CONFIG */}
      {showTraccarConfig && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Servidor Traccar</h2>
                      <button onClick={() => setShowTraccarConfig(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleTraccarSync} className="p-6 space-y-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">URL do Servidor</label>
                          <input type="url" required value={traccarForm.url} onChange={e => setTraccarForm({...traccarForm, url: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500" placeholder="http://meu-rastreador.com:8082" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Usuário / Email</label>
                          <input type="text" required value={traccarForm.user} onChange={e => setTraccarForm({...traccarForm, user: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Senha da API</label>
                          <input type="password" required value={traccarForm.pass} onChange={e => setTraccarForm({...traccarForm, pass: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500" />
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setShowTraccarConfig(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold">Cancelar</button>
                          <button type="submit" disabled={isSyncing} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                              Sincronizar
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* FORM MODAL SIMPLIFIED */}
      {isFormOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">{editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h2>
                      <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleFormSubmit} className="p-6 grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Modelo do Veículo</label>
                          <input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500" placeholder="Ex: Mercedes-Benz Sprinter" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Placa</label>
                          <input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 font-mono" placeholder="ABC-1234" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">ID Rastreador (IMEI)</label>
                          <input required value={formData.trackerId} onChange={e => setFormData({...formData, trackerId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 font-mono" />
                      </div>
                      <div className="col-span-2 pt-4 flex gap-3">
                          <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold">Cancelar</button>
                          <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20">Salvar no Supabase</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
