import React, { useState } from 'react';
import { Driver, Vehicle } from '../types';
import { Star, Phone, FileText, Search, Plus, MoreVertical, Edit, Trash2, X, Check, Truck, User, Shield } from 'lucide-react';

interface EmployeeListProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onAddDriver: (driver: Omit<Driver, 'id'>) => void;
  onUpdateDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ drivers, vehicles, onAddDriver, onUpdateDriver, onDeleteDriver }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    license: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
    avatar: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filter Logic
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          driver.license.includes(searchTerm) || 
                          driver.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (driver: Driver, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDriver(driver);
    setFormData({
        name: driver.name,
        license: driver.license,
        phone: driver.phone,
        status: driver.status,
        avatar: driver.avatar
    });
    setIsFormOpen(true);
  };

  const handleOpenDetail = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDetailOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este motorista?')) {
        onDeleteDriver(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate avatar if empty
    const finalAvatar = formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;

    if (editingDriver) {
        onUpdateDriver({
            ...editingDriver,
            ...formData,
            avatar: finalAvatar
        });
    } else {
        onAddDriver({
            ...formData,
            avatar: finalAvatar,
            rating: 5.0
        });
    }
    setIsFormOpen(false);
  };

  // Helper to find assigned vehicle
  const getAssignedVehicle = (driverId: string) => vehicles.find(v => v.driverId === driverId);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto animate-fade-in pb-24 md:pb-8 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Funcionários</h1>
           <p className="text-slate-400">Gestão de motoristas e equipe de campo.</p>
        </div>
        <button 
            onClick={handleOpenAdd}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 font-medium"
        >
            <Plus className="w-5 h-5" />
            Novo Motorista
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
                type="text" 
                placeholder="Buscar por nome, CNH ou telefone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
         </div>
         <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
             <button 
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                 Todos
             </button>
             <button 
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'active' ? 'bg-green-900/30 text-green-400 shadow border border-green-500/20' : 'text-slate-400 hover:text-white'}`}
             >
                 Ativos
             </button>
             <button 
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'inactive' ? 'bg-red-900/30 text-red-400 shadow border border-red-500/20' : 'text-slate-400 hover:text-white'}`}
             >
                 Inativos
             </button>
         </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDrivers.map(driver => (
            <div 
                key={driver.id} 
                onClick={() => handleOpenDetail(driver)}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm group hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer relative"
            >
                {/* Actions Menu (Absolute) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => handleOpenEdit(driver, e)}
                        className="p-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(driver.id, e)}
                        className="p-1.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center mb-4">
                    <div className="relative">
                        <img src={driver.avatar} alt={driver.name} className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-lg object-cover mb-3 group-hover:scale-105 transition-transform" />
                        <span className={`absolute bottom-3 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                            driver.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                    </div>
                    <h3 className="text-white font-bold text-lg">{driver.name}</h3>
                    <p className="text-slate-500 text-sm">ID: {driver.id}</p>
                    
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full mt-2 border border-yellow-500/20">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-500 font-bold text-xs">{driver.rating.toFixed(1)}</span>
                    </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>CNH</span>
                        </div>
                        <span className="text-slate-200 font-mono">{driver.license}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span>Contato</span>
                        </div>
                        <span className="text-slate-200">{driver.phone}</span>
                    </div>
                </div>

                {/* Assigned Vehicle Mini Badge */}
                {getAssignedVehicle(driver.id) ? (
                    <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 flex items-center gap-2 text-xs text-blue-300">
                        <Truck className="w-3 h-3" />
                        <span>{getAssignedVehicle(driver.id)?.model}</span>
                    </div>
                ) : (
                    <div className="mt-4 bg-slate-800/30 border border-slate-700/30 rounded-lg p-2 text-center text-xs text-slate-500">
                        Nenhum veículo vinculado
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* --- FORM MODAL (ADD/EDIT) --- */}
      {isFormOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={() => setIsFormOpen(false)}>
            <div 
                className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {editingDriver ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
                        {editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
                    </h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Ex: João Silva"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">CNH</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="123456789"
                                value={formData.license}
                                onChange={e => setFormData({...formData, license: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="(11) 99999-9999"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                        <select 
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                        >
                            <option value="active">Ativo (Disponível)</option>
                            <option value="inactive">Inativo (Férias/Licença)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">URL da Foto (Opcional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                            placeholder="https://..."
                            value={formData.avatar}
                            onChange={e => setFormData({...formData, avatar: e.target.value})}
                        />
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
                            {editingDriver ? 'Salvar Alterações' : 'Criar Motorista'}
                        </button>
                    </div>
                </form>
            </div>
         </div>
      )}

      {/* --- DETAIL MODAL --- */}
      {selectedDriver && isDetailOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={() => setIsDetailOpen(false)}>
              <div 
                  className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="relative h-32 bg-gradient-to-r from-blue-900 to-slate-900">
                      <button onClick={() => setIsDetailOpen(false)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="px-8 pb-8">
                      <div className="flex justify-between items-end -mt-12 mb-6">
                          <div className="relative">
                              <img src={selectedDriver.avatar} alt={selectedDriver.name} className="w-24 h-24 rounded-full border-4 border-slate-950 shadow-xl object-cover bg-slate-800" />
                              <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-slate-950 ${
                                  selectedDriver.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                onClick={(e) => { setIsDetailOpen(false); handleOpenEdit(selectedDriver, e); }}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors"
                              >
                                  Editar Perfil
                              </button>
                          </div>
                      </div>

                      <div>
                          <h2 className="text-2xl font-bold text-white">{selectedDriver.name}</h2>
                          <p className="text-slate-400">ID: {selectedDriver.id} • Cadastrado em 2024</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          <div className="space-y-4">
                              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Informações Pessoais</h3>
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                      <div className="flex items-center gap-3 text-slate-400">
                                          <FileText className="w-4 h-4" />
                                          <span>CNH</span>
                                      </div>
                                      <span className="text-white font-mono">{selectedDriver.license}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                      <div className="flex items-center gap-3 text-slate-400">
                                          <Phone className="w-4 h-4" />
                                          <span>Telefone</span>
                                      </div>
                                      <span className="text-white">{selectedDriver.phone}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                      <div className="flex items-center gap-3 text-slate-400">
                                          <Shield className="w-4 h-4" />
                                          <span>Status</span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                          selectedDriver.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                      }`}>
                                          {selectedDriver.status === 'active' ? 'Ativo' : 'Inativo'}
                                      </span>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Desempenho & Frota</h3>
                              
                              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl">
                                  <p className="text-slate-400 text-xs mb-1">Avaliação Geral</p>
                                  <div className="flex items-center gap-2">
                                      <span className="text-3xl font-bold text-white">{selectedDriver.rating.toFixed(1)}</span>
                                      <div className="flex">
                                          {[1,2,3,4,5].map(star => (
                                              <Star key={star} className={`w-4 h-4 ${star <= Math.round(selectedDriver.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
                                          ))}
                                      </div>
                                  </div>
                              </div>

                              <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                                  <p className="text-blue-400 text-xs mb-2 font-bold uppercase">Veículo Atual</p>
                                  {getAssignedVehicle(selectedDriver.id) ? (
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-blue-600 rounded-lg">
                                              <Truck className="w-5 h-5 text-white" />
                                          </div>
                                          <div>
                                              <p className="text-white font-bold">{getAssignedVehicle(selectedDriver.id)?.model}</p>
                                              <p className="text-slate-400 text-xs font-mono">{getAssignedVehicle(selectedDriver.id)?.plate}</p>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                                          <User className="w-4 h-4" />
                                          <span>Não está dirigindo no momento.</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};