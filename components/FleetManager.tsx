
import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, VehicleStatus, Driver } from '../types';
import { 
    Search, Plus, Battery, Signal, X, Wrench, Calendar, User, MapPin, 
    Edit, Trash2, CheckCircle, AlertTriangle, Radio, Lock, Unlock, Shield, 
    Circle, Loader2, Gauge, Clock, Activity, Download, Copy, History, Navigation
} from 'lucide-react';

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
  
  // Feedback
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'alert'} | null>(null);

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    trackerId: '',
    driverId: '',
    status: VehicleStatus.STOPPED,
    fuelLevel: 50,
  });

  // Details Modal States
  const [detailTab, setDetailTab] = useState<'overview' | 'maintenance' | 'security'>('overview');
  const [maintenanceHistory, setMaintenanceHistory] = useState([
    { id: 1, date: '15/05/2024', type: 'Troca de Óleo', cost: 'R$ 450,00', mechanic: 'AutoCenter Silva', vehicleId: 'v1' },
    { id: 2, date: '10/02/2024', type: 'Alinhamento', cost: 'R$ 180,00', mechanic: 'Pneus Express', vehicleId: 'v1' },
    { id: 3, date: '20/11/2023', type: 'Revisão Geral', cost: 'R$ 1.200,00', mechanic: 'Concessionária', vehicleId: 'v2' },
  ]);
  const [newMaintenance, setNewMaintenance] = useState({ type: '', cost: '', date: '' });
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // --- ACTION HANDLER (Auto Open) ---
  useEffect(() => {
    if (initialAction === 'open_add_vehicle') {
        handleOpenAdd();
        if (onClearAction) onClearAction();
    }
  }, [initialAction]);

  // Limpar Toast automaticamente
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- CRUD HANDLERS ---

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({ plate: '', model: '', trackerId: '', driverId: '', status: VehicleStatus.STOPPED, fuelLevel: 50 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    setFormData({
        plate: vehicle.plate,
        model: vehicle.model,
        trackerId: vehicle.trackerId || '',
        driverId: vehicle.driverId || '',
        status: vehicle.status,
        fuelLevel: vehicle.fuelLevel
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Tem certeza que deseja remover este veículo? Esta ação não pode ser desfeita.')) {
        onDeleteVehicle(id);
        if(selectedVehicle?.id === id) setSelectedVehicle(null);
        setToast({ msg: 'Veículo removido com sucesso.', type: 'success' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const location = editingVehicle ? editingVehicle.location : { lat: -23.5505 + (Math.random() * 0.01), lng: -46.6333 + (Math.random() * 0.01) };

    const payload = {
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        trackerId: formData.trackerId,
        driverId: formData.driverId || undefined,
        status: formData.status as VehicleStatus,
        fuelLevel: Number(formData.fuelLevel),
        speed: formData.status === VehicleStatus.MOVING ? Math.floor(Math.random() * 80) + 20 : 0,
        location: location,
        lastUpdate: 'Agora',
        ignition: editingVehicle ? editingVehicle.ignition : (formData.status === VehicleStatus.MOVING),
        isLocked: editingVehicle ? editingVehicle.isLocked : false,
        geofenceActive: editingVehicle ? editingVehicle.geofenceActive : false,
        geofenceRadius: editingVehicle ? editingVehicle.geofenceRadius : 1000
    };

    if (editingVehicle) {
        onUpdateVehicle({ ...editingVehicle, ...payload });
    } else {
        onAddVehicle(payload);
    }
    setIsFormOpen(false);
  };

  // --- SECURITY HANDLERS ---
  
  const handleLockToggle = async () => {
      if (!selectedVehicle) return;
      const isLocking = !selectedVehicle.isLocked;
      
      setLoadingAction('lock');
      
      // Simula delay
      setTimeout(() => {
          onToggleLock(selectedVehicle.id);
          setSelectedVehicle(prev => prev ? {...prev, isLocked: isLocking, status: isLocking ? VehicleStatus.STOPPED : prev.status} : null);
          setLoadingAction(null);
          setToast({ 
              msg: isLocking ? 'Comando enviado: Veículo BLOQUEADO.' : 'Comando enviado: Veículo DESBLOQUEADO.', 
              type: isLocking ? 'alert' : 'success' 
          });
      }, 1500);
  };

  const handleGeofenceToggle = (active: boolean) => {
    if (!selectedVehicle) return;
    onUpdateGeofence(selectedVehicle.id, active, selectedVehicle.geofenceActive ? selectedVehicle.geofenceRadius : 1000);
    setSelectedVehicle(prev => prev ? {...prev, geofenceActive: active} : null);
    setToast({ msg: active ? 'Cerca Virtual ativada.' : 'Cerca Virtual desativada.', type: 'success' });
  };

  const handleRadiusChange = (radius: number) => {
      if (!selectedVehicle) return;
      onUpdateGeofence(selectedVehicle.id, selectedVehicle.geofenceActive, radius);
      setSelectedVehicle(prev => prev ? {...prev, geofenceRadius: radius} : null);
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVehicle) return;
      
      const newItem = {
          id: Date.now(),
          vehicleId: selectedVehicle.id,
          date: newMaintenance.date || new Date().toLocaleDateString('pt-BR'),
          type: newMaintenance.type,
          cost: newMaintenance.cost,
          mechanic: 'Oficina Interna'
      };
      
      setMaintenanceHistory([newItem, ...maintenanceHistory]);
      setNewMaintenance({ type: '', cost: '', date: '' });
      setShowMaintenanceForm(false);
      setToast({ msg: 'Manutenção registrada.', type: 'success' });
  };
  
  // --- HELPER FUNCTIONS ---

  const getDriver = (driverId?: string) => drivers.find(d => d.id === driverId);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'moving' && vehicle.status === VehicleStatus.MOVING) ||
        (statusFilter === 'stopped' && vehicle.status === VehicleStatus.STOPPED) ||
        (statusFilter === 'offline' && vehicle.status === VehicleStatus.OFFLINE) ||
        (statusFilter === 'locked' && vehicle.isLocked);

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const vehicleMaintenance = useMemo(() => {
      if (!selectedVehicle) return [];
      return maintenanceHistory.filter(m => m.vehicleId === selectedVehicle.id || m.vehicleId === 'all');
  }, [selectedVehicle, maintenanceHistory]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto animate-fade-in pb-24 md:pb-8 relative">
      
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
              <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
                  toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-blue-900/90 border-blue-500 text-blue-100'
              } backdrop-blur-md`}>
                  {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  <span className="font-medium text-sm">{toast.msg}</span>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Gestão de Frota</h1>
           <p className="text-slate-400 text-sm md:text-base">Controle total de veículos, segurança e manutenção.</p>
        </div>
        <button 
            onClick={handleOpenAdd}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 font-medium active:scale-95 duration-200"
        >
            <Plus className="w-5 h-5" />
            Adicionar Veículo
        </button>
      </div>

      <div className="bg-transparent md:bg-slate-900/50 md:border md:border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        {/* Filters */}
        <div className="p-0 md:p-4 md:border-b md:border-slate-800 flex flex-col md:flex-row gap-4 mb-4 md:mb-0">
            <div className="relative flex-1 max-w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por placa, modelo..." 
                    className="w-full bg-slate-900 md:bg-slate-950 border border-slate-800 rounded-xl md:rounded-lg pl-10 pr-4 py-3 md:py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 md:bg-slate-950 border border-slate-800 rounded-xl md:rounded-lg px-4 py-3 md:py-2 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
                <option value="all">Todos os Status</option>
                <option value="moving">Em Movimento</option>
                <option value="stopped">Parado</option>
                <option value="offline">Offline</option>
                <option value="locked">Bloqueados</option>
            </select>
        </div>

        {/* Table / Cards List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/80 text-slate-400 text-sm uppercase font-semibold hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Saúde</th>
                <th className="px-6 py-4">Última Atualização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 block md:table-row-group space-y-4 md:space-y-0">
              {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} 
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`
                        flex flex-col md:table-row 
                        bg-slate-900 md:bg-transparent 
                        border md:border-0 
                        rounded-2xl md:rounded-none 
                        p-4 md:p-0 
                        transition-colors cursor-pointer group relative
                        ${vehicle.isLocked ? 'border-red-500/30 bg-red-900/5' : 'border-slate-800 hover:bg-slate-800/30'}
                    `}>
                      <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between md:table-cell items-center border-b border-slate-800/50 md:border-0 mb-2 md:mb-0 pb-2 md:pb-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden ${vehicle.isLocked ? 'bg-red-900/20' : 'bg-slate-800'}`}>
                                <TruckIcon className={`w-6 h-6 ${vehicle.isLocked ? 'text-red-500' : 'text-slate-400'}`} />
                                {vehicle.isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                        <Lock className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className={`font-medium group-hover:text-blue-400 transition-colors ${vehicle.isLocked ? 'text-red-400' : 'text-white'}`}>{vehicle.model}</div>
                                <div className="text-xs text-slate-500">ID: {vehicle.id}</div>
                            </div>
                        </div>
                      </td>
                      
                      <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between md:table-cell items-center">
                        <span className="text-slate-500 text-sm md:hidden">Placa:</span>
                        <span className="font-mono text-slate-300 bg-slate-950 md:bg-slate-900 px-2 py-1 rounded border border-slate-800 text-sm md:text-base">
                            {vehicle.plate}
                        </span>
                      </td>
                      
                      <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between md:table-cell items-center">
                        <span className="text-slate-500 text-sm md:hidden">Status:</span>
                        <div className="flex items-center gap-2">
                             {vehicle.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              vehicle.isLocked ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              vehicle.status === VehicleStatus.MOVING ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              vehicle.status === VehicleStatus.STOPPED ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-slate-700/50 text-slate-400 border-slate-600/30'
                            }`}>
                              {vehicle.isLocked ? 'Bloqueado' : vehicle.status}
                            </span>
                        </div>
                      </td>
                      
                      <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between md:table-cell items-center">
                        <span className="text-slate-500 text-sm md:hidden">Saúde:</span>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1 text-slate-400 text-xs" title="Combustível">
                                <Battery className={`w-4 h-4 ${vehicle.fuelLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                                {vehicle.fuelLevel}%
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-xs" title="Sinal GPS">
                                <Signal className="w-4 h-4 text-blue-500" />
                                Bom
                            </div>
                        </div>
                      </td>
                      
                      <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between md:table-cell items-center text-sm text-slate-400">
                        <span className="text-slate-500 text-sm md:hidden">Atualizado:</span>
                        {vehicle.lastUpdate}
                      </td>
                      
                      <td className="px-6 py-4 text-right md:table-cell pt-4 md:pt-4 border-t border-slate-800/50 md:border-0">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={(e) => handleOpenEdit(vehicle, e)}
                                className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => handleDelete(vehicle.id, e)}
                                className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          Nenhum veículo encontrado com os filtros atuais.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FORM MODAL (ADD/EDIT) --- */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={() => setIsFormOpen(false)}>
            <div 
                className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {editingVehicle ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                        {editingVehicle ? 'Editar Veículo/Dispositivo' : 'Adicionar Veículo/Dispositivo'}
                    </h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar p-6">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome / Modelo</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Ex: Fiat Fiorino ou Celular Motorista"
                                value={formData.model}
                                onChange={e => setFormData({...formData, model: e.target.value})}
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Identificador (Placa ou Nome)</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                                placeholder="ABC-1234 ou IPHONE-JOAO"
                                value={formData.plate}
                                onChange={e => setFormData({...formData, plate: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Radio className="w-3 h-3 text-blue-500" />
                                ID do Rastreador (IMEI ou ID Traccar Client)
                            </label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                                placeholder="Ex: 866391040..."
                                value={formData.trackerId}
                                onChange={e => setFormData({...formData, trackerId: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Motorista Responsável</label>
                            <select 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                                value={formData.driverId}
                                onChange={e => setFormData({...formData, driverId: e.target.value})}
                            >
                                <option value="">-- Sem motorista --</option>
                                {drivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>{driver.name} ({driver.status})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Status Inicial</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none text-sm"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as VehicleStatus})}
                                >
                                    <option value={VehicleStatus.STOPPED}>Parado</option>
                                    <option value={VehicleStatus.MOVING}>Em Movimento</option>
                                    <option value={VehicleStatus.OFFLINE}>Offline</option>
                                    <option value={VehicleStatus.maintenance}>Manutenção</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Combustível / Bateria %</label>
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    value={formData.fuelLevel}
                                    onChange={e => setFormData({...formData, fuelLevel: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
                            >
                                {editingVehicle ? 'Salvar' : 'Adicionar Dispositivo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
         </div>
      )}

      {/* --- PREMIUM DETAILS MODAL OPTIMIZED --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div 
             className="bg-slate-950 border border-slate-800 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Modal Header Premium */}
              <div className="relative shrink-0 h-48 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 overflow-hidden border-b border-white/5">
                 {/* Decorative background elements */}
                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-between p-8 z-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md ${selectedVehicle.isLocked ? 'bg-red-900/30' : 'bg-white/5'}`}>
                           {selectedVehicle.isLocked ? <Lock className="w-10 h-10 text-red-500 drop-shadow-lg" /> : <TruckIcon className="w-12 h-12 text-white drop-shadow-lg" />}
                        </div>
                        <div className="space-y-2">
                           <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">{selectedVehicle.model}</h2>
                           <div className="flex items-center gap-3">
                               <span className="font-mono text-xl text-blue-300 bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-500/30 font-bold tracking-wider">
                                   {selectedVehicle.plate}
                               </span>
                               <span className={`text-xs px-3 py-1.5 rounded-full uppercase font-bold tracking-wider border shadow-lg ${
                                    selectedVehicle.isLocked ? 'bg-red-500 text-white border-red-400' :
                                    selectedVehicle.status === VehicleStatus.MOVING ? 'bg-green-500 text-white border-green-400' : 
                                    selectedVehicle.status === VehicleStatus.STOPPED ? 'bg-yellow-500 text-white border-yellow-400' :
                                    'bg-slate-700 text-slate-200 border-slate-600'
                               }`}>
                                   {selectedVehicle.isLocked ? 'BLOQUEADO' : selectedVehicle.status}
                               </span>
                           </div>
                           <p className="text-slate-400 text-sm flex items-center gap-2">
                               <Clock className="w-3.5 h-3.5" /> Última sincronização: {selectedVehicle.lastUpdate}
                           </p>
                        </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedVehicle(null)}
                      className="p-3 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm self-start border border-white/5"
                    >
                        <X className="w-6 h-6" />
                    </button>
                 </div>
              </div>

              {/* Navigation Tabs - Modern Pill Style */}
              <div className="flex items-center justify-center border-b border-slate-800 bg-slate-950/80 px-6 py-2 shrink-0">
                  <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800/50">
                      {(['overview', 'security', 'maintenance'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setDetailTab(tab)}
                            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                                detailTab === tab 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                            }`}
                        >
                            {tab === 'overview' && <Activity className="w-4 h-4" />}
                            {tab === 'security' && <Shield className="w-4 h-4" />}
                            {tab === 'maintenance' && <Wrench className="w-4 h-4" />}
                            <span className="capitalize">{tab === 'overview' ? 'Visão Geral' : tab === 'security' ? 'Segurança' : 'Manutenção'}</span>
                        </button>
                      ))}
                  </div>
              </div>

              {/* Modal Body - Scrollable Area */}
              <div className="overflow-y-auto flex-1 p-8 custom-scrollbar bg-slate-950 relative">
                 
                 {/* TAB: VISÃO GERAL */}
                 {detailTab === 'overview' && (
                     <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        {/* KPI Grid Glassmorphism */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="group bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Gauge className="w-20 h-20 text-blue-500" />
                                 </div>
                                 <div className="relative z-10">
                                     <div className="flex items-center gap-2 text-slate-400 mb-3">
                                         <Gauge className="w-5 h-5 text-blue-500" />
                                         <span className="text-xs font-bold uppercase tracking-wider">Velocidade Atual</span>
                                     </div>
                                     <div className="flex items-baseline gap-2">
                                         <span className="text-4xl font-bold text-white">{selectedVehicle.speed}</span>
                                         <span className="text-sm font-medium text-slate-500 uppercase">km/h</span>
                                     </div>
                                     <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                         <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${(selectedVehicle.speed / 120) * 100}%`}}></div>
                                     </div>
                                 </div>
                             </div>

                             <div className="group bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-green-500/30 transition-all shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Battery className="w-20 h-20 text-green-500" />
                                 </div>
                                 <div className="relative z-10">
                                     <div className="flex items-center gap-2 text-slate-400 mb-3">
                                         <Battery className={`w-5 h-5 ${selectedVehicle.fuelLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                                         <span className="text-xs font-bold uppercase tracking-wider">Nível Combustível</span>
                                     </div>
                                     <div className="flex items-baseline gap-2">
                                         <span className="text-4xl font-bold text-white">{selectedVehicle.fuelLevel}</span>
                                         <span className="text-sm font-medium text-slate-500 uppercase">%</span>
                                     </div>
                                     <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                         <div className={`h-full rounded-full transition-all duration-1000 ${selectedVehicle.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${selectedVehicle.fuelLevel}%`}}></div>
                                     </div>
                                 </div>
                             </div>

                             <div className="group bg-gradient-to-br from-slate-900 to-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all shadow-xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity className="w-20 h-20 text-purple-500" />
                                 </div>
                                 <div className="relative z-10">
                                     <div className="flex items-center gap-2 text-slate-400 mb-3">
                                         <Activity className="w-5 h-5 text-purple-500" />
                                         <span className="text-xs font-bold uppercase tracking-wider">Odômetro Total</span>
                                     </div>
                                     <div className="flex items-baseline gap-2">
                                         <span className="text-4xl font-bold text-white">84.250</span>
                                         <span className="text-sm font-medium text-slate-500 uppercase">km</span>
                                     </div>
                                     <div className="mt-4 text-xs text-slate-500">
                                         Próxima revisão em 750 km
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Layout Split: Driver & Location */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Driver Card ID Style */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-lg">
                                <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-500" /> Motorista Vinculado
                                    </h3>
                                    {getDriver(selectedVehicle.driverId) && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">ATIVO</span>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    {getDriver(selectedVehicle.driverId) ? (
                                        <div className="flex items-center gap-6">
                                            <div className="relative shrink-0">
                                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-600 to-slate-800 shadow-xl">
                                                    <img 
                                                        src={getDriver(selectedVehicle.driverId)?.avatar} 
                                                        alt="Driver" 
                                                        className="w-full h-full rounded-full object-cover border-4 border-slate-900" 
                                                    />
                                                </div>
                                                <div className="absolute bottom-1 right-1 bg-slate-900 p-1 rounded-full">
                                                    <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-bold text-white">{getDriver(selectedVehicle.driverId)?.name}</h4>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                        <Radio className="w-3.5 h-3.5" /> {getDriver(selectedVehicle.driverId)?.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                        <Shield className="w-3.5 h-3.5" /> CNH: {getDriver(selectedVehicle.driverId)?.license}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                                            <User className="w-12 h-12 text-slate-700 mb-3" />
                                            <p className="text-slate-500 font-medium">Nenhum motorista vinculado</p>
                                            <button 
                                                onClick={(e) => handleOpenEdit(selectedVehicle, e)}
                                                className="text-blue-500 text-sm font-bold hover:text-blue-400 mt-2 hover:underline"
                                            >
                                                Vincular Agora
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Card with Live Pulse */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                                <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" /> Coordenadas GPS
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Sinal Ao Vivo</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center gap-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                                                <Navigation className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold">Latitude</p>
                                                <p className="text-white font-mono text-lg">{selectedVehicle.location.lat.toFixed(6)}</p>
                                            </div>
                                        </div>
                                        <Copy className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                                                <Navigation className="w-5 h-5 transform rotate-90" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold">Longitude</p>
                                                <p className="text-white font-mono text-lg">{selectedVehicle.location.lng.toFixed(6)}</p>
                                            </div>
                                        </div>
                                        <Copy className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                 )}

                 {/* TAB: MANUTENÇÃO (Timeline Style) */}
                 {detailTab === 'maintenance' && (
                     <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
                         <div className="flex justify-between items-center mb-4 shrink-0">
                             <div>
                                 <h3 className="text-xl font-bold text-white">Linha do Tempo</h3>
                                 <p className="text-slate-400 text-sm">Histórico de serviços e reparos.</p>
                             </div>
                             <button 
                                onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm font-bold transition-all active:scale-95"
                             >
                                 <Plus className="w-4 h-4" />
                                 Novo Registro
                             </button>
                         </div>

                         {/* Add Form */}
                         {showMaintenanceForm && (
                             <form onSubmit={handleAddMaintenance} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-in slide-in-from-top-4 mb-6 shrink-0 shadow-xl">
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo de Serviço</label>
                                         <input 
                                            required
                                            type="text" 
                                            placeholder="Ex: Troca de Óleo"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                            value={newMaintenance.type}
                                            onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value})}
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data</label>
                                         <input 
                                            required
                                            type="text" 
                                            placeholder="DD/MM/AAAA"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                            value={newMaintenance.date}
                                            onChange={e => setNewMaintenance({...newMaintenance, date: e.target.value})}
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Custo (R$)</label>
                                         <input 
                                            required
                                            type="text" 
                                            placeholder="0,00"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                            value={newMaintenance.cost}
                                            onChange={e => setNewMaintenance({...newMaintenance, cost: e.target.value})}
                                         />
                                     </div>
                                 </div>
                                 <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                                     <button type="button" onClick={() => setShowMaintenanceForm(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">Cancelar</button>
                                     <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-md">Salvar</button>
                                 </div>
                             </form>
                         )}

                         {/* Timeline List */}
                         <div className="relative pl-4 md:pl-8 space-y-8 pb-4">
                             {/* Timeline Vertical Line */}
                             <div className="absolute top-2 bottom-0 left-[23px] md:left-[39px] w-0.5 bg-gradient-to-b from-blue-500 to-slate-800"></div>

                             {vehicleMaintenance.length > 0 ? (
                                 vehicleMaintenance.map((item, idx) => (
                                    <div key={idx} className="relative pl-8 md:pl-10 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-[15px] md:left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-4 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 group-hover:scale-125 transition-transform"></div>
                                        
                                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all hover:bg-slate-900/80 shadow-lg relative">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-500 shrink-0 border border-slate-700">
                                                        <Wrench className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg">{item.type}</h4>
                                                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                                                            <User className="w-3 h-3" /> {item.mechanic}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                                                    <span className="text-white font-mono font-bold text-xl bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{item.cost}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                                                        <Calendar className="w-3 h-3" /> {item.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                 ))
                             ) : (
                                 <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 ml-8">
                                     <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                     <p className="font-medium">Nenhum registro de manutenção.</p>
                                     <p className="text-xs">Clique em "Novo Registro" para começar.</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/90 flex justify-between items-center shrink-0">
                 <button 
                    onClick={(e) => handleDelete(selectedVehicle.id, e)}
                    className="text-red-400 hover:text-white hover:bg-red-600/20 px-4 py-2 rounded-xl transition-colors text-sm font-bold flex items-center gap-2 border border-transparent hover:border-red-500/30"
                 >
                     <Trash2 className="w-4 h-4" />
                     Excluir Veículo
                 </button>
                 <div className="flex gap-3">
                    <button 
                        onClick={() => setSelectedVehicle(null)}
                        className="px-6 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={(e) => { setSelectedVehicle(null); handleOpenEdit(selectedVehicle, e); }}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95 font-bold flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Editar Dados
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TruckIcon = ({className}: {className?: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
);
