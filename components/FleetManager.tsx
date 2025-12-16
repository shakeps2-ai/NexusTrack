import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, VehicleStatus, Driver } from '../types';
import { 
    Search, Plus, Battery, Signal, Eye, X, Wrench, Calendar, TrendingUp, User, MapPin, 
    MoreVertical, Edit, Trash2, CheckCircle, AlertTriangle, FileText, ChevronRight, Phone,
    Lock, Unlock, Shield, Zap, Circle, Loader2, Gauge, Clock, Activity, Radio, Smartphone, Download
} from 'lucide-react';

interface FleetManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateGeofence: (id: string, active: boolean, radius: number) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({ 
    vehicles, drivers, onAddVehicle, onUpdateVehicle, onDeleteVehicle, onToggleLock, onUpdateGeofence 
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Feedback
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'alert'} | null>(null);

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showMobileGuide, setShowMobileGuide] = useState(false); // New state for tutorial
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
    setShowMobileGuide(false);
    setFormData({ plate: '', model: '', trackerId: '', driverId: '', status: VehicleStatus.STOPPED, fuelLevel: 50 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    setShowMobileGuide(false);
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
    
    // Random location for simulation if new
    const location = editingVehicle ? editingVehicle.location : { lat: 0, lng: 0 };

    const payload = {
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        trackerId: formData.trackerId,
        driverId: formData.driverId || undefined,
        status: formData.status as VehicleStatus,
        fuelLevel: Number(formData.fuelLevel),
        speed: 0,
        location: location,
        lastUpdate: 'Agora', // FIX: Added to satisfy type requirement
        // Mantém propriedades existentes se editando
        ignition: editingVehicle ? editingVehicle.ignition : false,
        isLocked: editingVehicle ? editingVehicle.isLocked : false,
        geofenceActive: editingVehicle ? editingVehicle.geofenceActive : false,
        geofenceRadius: editingVehicle ? editingVehicle.geofenceRadius : 1000
    };

    if (editingVehicle) {
        onUpdateVehicle({ ...editingVehicle, ...payload });
        // Toast triggered by update in App.tsx or here
    } else {
        onAddVehicle(payload);
        // Toast triggered by update in App.tsx or here
    }
    setIsFormOpen(false);
  };

  // --- SECURITY HANDLERS ---
  
  const handleLockToggle = async () => {
      if (!selectedVehicle) return;
      const isLocking = !selectedVehicle.isLocked;
      
      setLoadingAction('lock');
      
      // Simula delay de comunicação com o rastreador
      setTimeout(() => {
          onToggleLock(selectedVehicle.id);
          // Update local state copy to reflect immediately in UI
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
                  toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-red-900/90 border-red-500 text-red-100'
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
                className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {editingVehicle ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                        {editingVehicle ? 'Editar Veículo/Dispositivo' : 'Adicionar Veículo/Dispositivo'}
                    </h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    
                    {/* HELP BOX FOR MOBILE */}
                    {!editingVehicle && (
                        <div className={`p-4 rounded-xl border transition-all ${showMobileGuide ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-900 border-slate-800'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 mb-2">
                                    <Smartphone className="w-4 h-4 text-blue-400" />
                                    <h4 className="text-sm font-bold text-white">Quer rastrear um celular?</h4>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setShowMobileGuide(!showMobileGuide)} 
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                    {showMobileGuide ? 'Esconder Guia' : 'Ver Como'}
                                </button>
                            </div>
                            
                            {showMobileGuide && (
                                <div className="mt-2 text-xs text-slate-300 space-y-2 animate-in slide-in-from-top-2">
                                    <p>1. Baixe o app <strong>Traccar Client</strong> no celular alvo.</p>
                                    <p>2. No app, em "URL do Servidor", use a mesma URL que você usou no login.</p>
                                    <p>3. Copie o número "Identificador do Dispositivo" que aparece no app.</p>
                                    <p>4. Cole esse número no campo <strong>ID do Rastreador</strong> abaixo.</p>
                                    <div className="flex gap-2 mt-3">
                                        <a href="#" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded flex items-center gap-1">
                                            <Download className="w-3 h-3" /> Android
                                        </a>
                                        <a href="#" className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded flex items-center gap-1">
                                            <Download className="w-3 h-3" /> iOS
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                        <p className="text-[10px] text-slate-500">Para Traccar Client, use o número mostrado no app.</p>
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
      )}

      {/* --- DETAILS MODAL OPTIMIZED --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div 
             className="bg-slate-950 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="relative p-6 border-b border-slate-800 bg-slate-900 overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>
                 <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl ${selectedVehicle.isLocked ? 'bg-red-900/50' : 'bg-gradient-to-br from-blue-600 to-slate-800'}`}>
                           {selectedVehicle.isLocked ? <Lock className="w-10 h-10 text-white" /> : <TruckIcon className="w-10 h-10 text-white" />}
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                               <h2 className="text-3xl font-bold text-white">{selectedVehicle.model}</h2>
                               <span className={`text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider border ${
                                    selectedVehicle.isLocked ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                    selectedVehicle.status === VehicleStatus.MOVING ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                    selectedVehicle.status === VehicleStatus.STOPPED ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-slate-700/50 text-slate-300 border-slate-600'
                               }`}>
                                   {selectedVehicle.isLocked ? 'BLOQUEADO' : selectedVehicle.status}
                               </span>
                           </div>
                           <div className="flex items-center gap-4 mt-2">
                               <p className="font-mono text-blue-400 font-bold text-lg px-2 py-0.5 bg-blue-900/20 rounded border border-blue-500/30">{selectedVehicle.plate}</p>
                               <span className="text-slate-400 text-sm flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> Atualizado: {selectedVehicle.lastUpdate}
                               </span>
                           </div>
                        </div>
                    </div>
                    <button 
                      onClick={() => setSelectedVehicle(null)}
                      className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                 </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 overflow-x-auto">
                  <button 
                    onClick={() => setDetailTab('overview')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${detailTab === 'overview' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                      <Activity className="w-4 h-4" />
                      Visão Geral
                  </button>
                  <button 
                    onClick={() => setDetailTab('security')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${detailTab === 'security' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                      <Shield className="w-4 h-4" />
                      Segurança
                  </button>
                  <button 
                    onClick={() => setDetailTab('maintenance')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${detailTab === 'maintenance' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                      <Wrench className="w-4 h-4" />
                      Manutenção
                  </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6 custom-scrollbar bg-slate-950">
                 
                 {/* TAB: VISÃO GERAL */}
                 {detailTab === 'overview' && (
                     <div className="space-y-6 animate-in fade-in duration-300">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                                 <div className="flex items-center gap-2 text-slate-400 mb-2">
                                     <Gauge className="w-4 h-4 text-blue-500" />
                                     <span className="text-xs font-bold uppercase">Velocidade</span>
                                 </div>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-2xl font-bold text-white">{selectedVehicle.speed}</span>
                                     <span className="text-xs text-slate-500">km/h</span>
                                 </div>
                             </div>

                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                                 <div className="flex items-center gap-2 text-slate-400 mb-2">
                                     <Battery className={`w-4 h-4 ${selectedVehicle.fuelLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                                     <span className="text-xs font-bold uppercase">Combustível</span>
                                 </div>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-2xl font-bold text-white">{selectedVehicle.fuelLevel}</span>
                                     <span className="text-xs text-slate-500">%</span>
                                 </div>
                                 <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                                     <div className={`h-full rounded-full ${selectedVehicle.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${selectedVehicle.fuelLevel}%`}}></div>
                                 </div>
                             </div>

                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                                 <div className="flex items-center gap-2 text-slate-400 mb-2">
                                     <Zap className={`w-4 h-4 ${selectedVehicle.ignition ? 'text-yellow-400' : 'text-slate-600'}`} />
                                     <span className="text-xs font-bold uppercase">Voltagem</span>
                                 </div>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-2xl font-bold text-white">12.4</span>
                                     <span className="text-xs text-slate-500">V</span>
                                 </div>
                             </div>

                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                                 <div className="flex items-center gap-2 text-slate-400 mb-2">
                                     <Activity className="w-4 h-4 text-purple-500" />
                                     <span className="text-xs font-bold uppercase">Odômetro</span>
                                 </div>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-2xl font-bold text-white">84.2</span>
                                     <span className="text-xs text-slate-500">k km</span>
                                 </div>
                             </div>
                        </div>

                        {/* Layout Split: Driver & Map Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Driver Card */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Motorista Vinculado
                                </h3>
                                
                                {getDriver(selectedVehicle.driverId) ? (
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-blue-500 to-slate-800">
                                                <img 
                                                    src={getDriver(selectedVehicle.driverId)?.avatar} 
                                                    alt="Driver" 
                                                    className="w-full h-full rounded-full object-cover border-2 border-slate-900" 
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-slate-900 p-1 rounded-full">
                                                <div className="bg-green-500 w-3 h-3 rounded-full border border-slate-900"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">{getDriver(selectedVehicle.driverId)?.name}</h4>
                                            <p className="text-slate-400 text-sm mb-2">{getDriver(selectedVehicle.driverId)?.phone}</p>
                                            <div className="flex gap-2">
                                                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
                                                    CNH: {getDriver(selectedVehicle.driverId)?.license}
                                                </span>
                                                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/20 font-bold flex items-center gap-1">
                                                    ★ {getDriver(selectedVehicle.driverId)?.rating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                                        <p>Sem motorista vinculado.</p>
                                        <button 
                                            onClick={(e) => handleOpenEdit(selectedVehicle, e)}
                                            className="text-blue-400 text-sm font-bold hover:text-blue-300 mt-2"
                                        >
                                            Vincular Agora
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Location & Tracker Card */}
                            <div className="flex flex-col gap-4">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex-1">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Localização Atual
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                            <span className="text-slate-500 text-sm">Latitude</span>
                                            <span className="text-white font-mono">{selectedVehicle.location.lat.toFixed(6)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                            <span className="text-slate-500 text-sm">Longitude</span>
                                            <span className="text-white font-mono">{selectedVehicle.location.lng.toFixed(6)}</span>
                                        </div>
                                        <div className="pt-2">
                                            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                                                <Signal className="w-4 h-4" />
                                                <span className="font-bold">Sinal GPS Forte</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Radio className="w-4 h-4" /> Dispositivo de Rastreamento
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">ID / IMEI:</span>
                                        <span className="font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20">
                                            {selectedVehicle.trackerId || 'Não registrado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                 )}

                 {/* TAB: SEGURANÇA */}
                 {detailTab === 'security' && (
                     <div className="space-y-6 animate-in slide-in-from-right-5 fade-in duration-300">
                         
                         {/* Block Control */}
                         <div className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                             selectedVehicle.isLocked 
                                ? 'bg-red-950/30 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]' 
                                : 'bg-slate-900/50 border-slate-800'
                         }`}>
                             <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                 <div>
                                     <h3 className={`text-xl font-bold flex items-center gap-2 ${selectedVehicle.isLocked ? 'text-red-400' : 'text-white'}`}>
                                         {selectedVehicle.isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6 text-green-500" />}
                                         Bloqueio de Veículo
                                     </h3>
                                     <p className="text-slate-400 text-sm mt-2 max-w-md">
                                         Esta ação corta a ignição ou o fornecimento de combustível do veículo remotamente. 
                                         Use apenas em casos de emergência ou roubo confirmado.
                                     </p>
                                     <div className="mt-4 flex gap-4 text-xs font-mono text-slate-500">
                                         <span>STATUS: <strong className={selectedVehicle.isLocked ? 'text-red-500' : 'text-green-500'}>{selectedVehicle.isLocked ? 'BLOQUEADO' : 'LIBERADO'}</strong></span>
                                         <span>LATÊNCIA: 120ms</span>
                                     </div>
                                 </div>
                                 
                                 <button
                                    onClick={handleLockToggle}
                                    disabled={loadingAction === 'lock'}
                                    className={`
                                        w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3
                                        ${selectedVehicle.isLocked 
                                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'}
                                        disabled:opacity-50 disabled:cursor-wait
                                    `}
                                 >
                                     {loadingAction === 'lock' ? (
                                         <Loader2 className="w-6 h-6 animate-spin" />
                                     ) : (
                                         selectedVehicle.isLocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />
                                     )}
                                     {selectedVehicle.isLocked ? 'DESBLOQUEAR VEÍCULO' : 'BLOQUEAR VEÍCULO'}
                                 </button>
                             </div>
                             {/* Warning background effect */}
                             {selectedVehicle.isLocked && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef444405_10px,#ef444405_20px)] pointer-events-none"></div>}
                         </div>

                         {/* Geofence Control */}
                         <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                             <div className="flex justify-between items-start mb-6">
                                 <div>
                                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                         <Circle className="w-5 h-5 text-blue-500" />
                                         Cerca Virtual (Geofence)
                                     </h3>
                                     <p className="text-slate-400 text-sm mt-1">
                                         Receba alertas se o veículo sair da área delimitada.
                                     </p>
                                 </div>
                                 <label className="relative inline-flex items-center cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={selectedVehicle.geofenceActive}
                                        onChange={(e) => handleGeofenceToggle(e.target.checked)}
                                     />
                                     <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                 </label>
                             </div>

                             <div className={`transition-all duration-300 ${selectedVehicle.geofenceActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                 <div className="mb-2 flex justify-between text-sm">
                                     <span className="text-slate-400">Raio de Segurança</span>
                                     <span className="text-white font-bold">{selectedVehicle.geofenceRadius} metros</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="100" 
                                    max="5000" 
                                    step="100" 
                                    value={selectedVehicle.geofenceRadius}
                                    onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                 />
                                 <div className="flex justify-between text-xs text-slate-500 mt-2">
                                     <span>100m</span>
                                     <span>5km</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* TAB: MANUTENÇÃO */}
                 {detailTab === 'maintenance' && (
                     <div className="space-y-6 animate-in fade-in duration-300">
                         {/* Maintenance Actions */}
                         <div className="flex justify-between items-center">
                             <div>
                                 <h3 className="text-lg font-bold text-white">Registro de Manutenções</h3>
                                 <p className="text-slate-400 text-xs">Histórico completo de serviços realizados.</p>
                             </div>
                             <button 
                                onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm font-bold transition-all active:scale-95"
                             >
                                 <Plus className="w-4 h-4" />
                                 Novo Registro
                             </button>
                         </div>

                         {/* Add Maintenance Form */}
                         {showMaintenanceForm && (
                             <form onSubmit={handleAddMaintenance} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-in slide-in-from-top-2">
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                     <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo de Serviço</label>
                                         <input 
                                            required
                                            type="text" 
                                            placeholder="Ex: Troca de Óleo"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                            value={newMaintenance.type}
                                            onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value})}
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data</label>
                                         <input 
                                            required
                                            type="text" 
                                            placeholder="DD/MM/AAAA"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                            value={newMaintenance.date}
                                            onChange={e => setNewMaintenance({...newMaintenance, date: e.target.value})}
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Custo (R$)</label>
                                         <input 
                                            required
                                            type="text" 
                                            placeholder="0,00"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                            value={newMaintenance.cost}
                                            onChange={e => setNewMaintenance({...newMaintenance, cost: e.target.value})}
                                         />
                                     </div>
                                 </div>
                                 <div className="flex justify-end gap-2">
                                     <button type="button" onClick={() => setShowMaintenanceForm(false)} className="px-3 py-1 text-slate-400 hover:text-white text-sm">Cancelar</button>
                                     <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">Salvar Registro</button>
                                 </div>
                             </form>
                         )}

                         {/* List */}
                         <div className="space-y-3">
                             {vehicleMaintenance.length > 0 ? (
                                 vehicleMaintenance.map((item, idx) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-500 shrink-0">
                                                <Wrench className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{item.type}</h4>
                                                <p className="text-xs text-slate-500">{item.mechanic}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-mono font-medium">{item.cost}</p>
                                            <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mt-0.5">
                                                <Calendar className="w-3 h-3" /> {item.date}
                                            </div>
                                        </div>
                                    </div>
                                 ))
                             ) : (
                                 <div className="text-center py-10 text-slate-500">
                                     <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                     <p>Nenhum registro de manutenção encontrado.</p>
                                 </div>
                             )}
                         </div>

                         {/* Recommendation */}
                         <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-3 mt-4">
                             <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                             <div>
                                 <h4 className="text-sm font-bold text-yellow-500">Próxima Revisão Recomendada</h4>
                                 <p className="text-xs text-slate-400 mt-1">Com base na quilometragem atual, recomenda-se agendar a revisão dos 50.000km em breve.</p>
                             </div>
                         </div>
                     </div>
                 )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                 <button 
                    onClick={(e) => handleDelete(selectedVehicle.id, e)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors"
                 >
                     <Trash2 className="w-4 h-4" />
                     Excluir Veículo
                 </button>
                 <div className="flex gap-3">
                    <button 
                        onClick={() => setSelectedVehicle(null)}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={(e) => { setSelectedVehicle(null); handleOpenEdit(selectedVehicle, e); }}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-2"
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