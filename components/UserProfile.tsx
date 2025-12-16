
import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, CreditCard, Mail, Phone, Building, Check, X, Camera, Key, Lock, ChevronRight, AlertCircle, Loader2, LogOut } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentUser: {
      name: string;
      email: string;
      phone: string;
      company: string;
  };
  onUpdateProfile: (data: any) => void;
}

type TabType = 'general' | 'security' | 'notifications' | 'billing';

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, onLogout, currentUser, onUpdateProfile }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Data State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    speed: true,
    geofence: true,
    maintenance: true,
    reports: false,
    ignition: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true
  });

  useEffect(() => {
    if (isOpen) {
      setSaveSuccess(false);
      setLoading(false);
      // Sync form with current user data when opening
      setFormData(prev => ({
          ...prev,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          company: currentUser.company
      }));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Fix: Type assertion for the dynamic key to avoid TS build error
    setFormData(prev => ({ ...prev, [name as keyof typeof formData]: value }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
        // Send updated data back to App
        onUpdateProfile({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company
        });
        
        setLoading(false);
        setSaveSuccess(true);
        setTimeout(() => {
            onClose();
        }, 1000);
    }, 1500);
  };

  const handleLogoutClick = () => {
      // Não fechamos o modal aqui (onClose).
      // Deixamos a função onLogout gerenciar a confirmação e o redirecionamento.
      // Se o usuário confirmar, o App desmonta este componente.
      // Se cancelar, o modal continua aberto.
      onLogout();
  };

  const navItems = [
    { id: 'general', label: 'Dados Pessoais', icon: User, desc: 'Informações básicas' },
    { id: 'security', label: 'Segurança', icon: Shield, desc: 'Senha e 2FA' },
    { id: 'notifications', label: 'Notificações', icon: Bell, desc: 'Preferências de alerta' },
    { id: 'billing', label: 'Plano Premium', icon: CreditCard, desc: 'Faturas e pagamentos' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 animate-fade-in pb-4">
            {/* Profile Header Card */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-600/50 to-transparent opacity-50"></div>
                
                <div className="relative group cursor-pointer shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-800 border-4 border-slate-950 shadow-xl overflow-hidden relative">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-slate-950"></div>
                </div>
                <div className="text-center md:text-left flex-1 min-w-0">
                    <div>
                        <h3 className="text-2xl font-bold text-white truncate">{formData.name || 'Usuário'}</h3>
                        <p className="text-blue-400 text-sm font-medium">Administrador Global</p>
                        <p className="text-slate-500 text-xs mt-1">Membro desde 2021</p>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                         <button className="text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-colors font-medium">
                            Alterar Foto
                         </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Nome Completo</label>
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-sm">
                        <User className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors shrink-0" />
                        <input 
                            name="name"
                            type="text" 
                            value={formData.name} 
                            onChange={handleInputChange}
                            className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-600 text-sm md:text-base font-medium" 
                        />
                    </div>
                </div>
                
                <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Email Corporativo</label>
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-sm">
                        <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors shrink-0" />
                        <input 
                            name="email"
                            type="email" 
                            value={formData.email} 
                            onChange={handleInputChange}
                            className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-600 text-sm md:text-base font-medium" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Telefone</label>
                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-sm">
                            <Phone className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors shrink-0" />
                            <input 
                                name="phone"
                                type="tel" 
                                value={formData.phone} 
                                onChange={handleInputChange}
                                className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-600 text-sm md:text-base font-medium" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Empresa</label>
                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-sm">
                            <Building className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors shrink-0" />
                            <input 
                                name="company"
                                type="text" 
                                value={formData.company} 
                                onChange={handleInputChange}
                                className="bg-transparent border-none focus:outline-none text-white w-full placeholder-slate-600 text-sm md:text-base font-medium" 
                            />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'security':
        return (
            <div className="space-y-6 animate-fade-in pb-4">
                <div className="p-5 bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">Autenticação de Dois Fatores</h4>
                            {securitySettings.twoFactor && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">ATIVO</span>}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">Proteção adicional via SMS para login.</p>
                    </div>
                    <button 
                        onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
                        className={`relative z-10 text-xs font-medium px-4 py-2.5 rounded-lg transition-all shrink-0 ${
                            securitySettings.twoFactor 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                        }`}
                    >
                        {securitySettings.twoFactor ? 'Desativar' : 'Ativar'}
                    </button>
                </div>

                <div className="space-y-5 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alterar Senha</h3>
                    </div>
                    
                    <div className="space-y-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 ml-1 font-bold">Senha Atual</label>
                            <input 
                                name="currentPassword"
                                type="password" 
                                placeholder="••••••••••••" 
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-700 text-sm transition-colors" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 ml-1 font-bold">Nova Senha</label>
                                <input 
                                    name="newPassword"
                                    type="password" 
                                    placeholder="Mín. 8 caracteres" 
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-700 text-sm transition-colors" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 ml-1 font-bold">Confirmar</label>
                                <input 
                                    name="confirmPassword"
                                    type="password" 
                                    placeholder="Repita a senha" 
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-700 text-sm transition-colors" 
                                />
                            </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-500 mt-2 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10">
                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                            <p>Sessões em outros dispositivos serão encerradas ao alterar a senha.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
      case 'notifications':
        return (
            <div className="space-y-4 animate-fade-in pb-4">
                <div className="mb-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <div>
                        <p className="text-sm font-bold text-white">Central de Alertas</p>
                        <p className="text-xs text-blue-200/70">Personalize o recebimento de notificações.</p>
                    </div>
                </div>

                 {[
                    { id: 'speed', title: 'Velocidade', desc: 'Alertar excesso de limite.' },
                    { id: 'geofence', title: 'Cerca Virtual', desc: 'Entrada/saída de zonas.' },
                    { id: 'maintenance', title: 'Manutenção', desc: 'Avisos preventivos.' },
                    { id: 'reports', title: 'Relatórios', desc: 'Resumo semanal por email.' },
                    { id: 'ignition', title: 'Ignição', desc: 'Uso fora de horário.' },
                 ].map((item) => (
                     <div 
                        key={item.id} 
                        onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                            notifications[item.id as keyof typeof notifications] 
                            ? 'bg-slate-900 border-slate-700 hover:border-blue-500/30' 
                            : 'bg-slate-950 border-slate-800 opacity-75 hover:opacity-100'
                        }`}
                     >
                         <div className="pr-4">
                             <h4 className={`text-sm font-bold transition-colors ${notifications[item.id as keyof typeof notifications] ? 'text-white' : 'text-slate-400'}`}>{item.title}</h4>
                             <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                         </div>
                         <div className={`w-11 h-6 rounded-full p-1 transition-all duration-300 shrink-0 ${
                             notifications[item.id as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-700'
                         }`}>
                             <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                 notifications[item.id as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                             }`} />
                         </div>
                     </div>
                 ))}
            </div>
        );
      case 'billing':
        return (
            <div className="space-y-6 animate-fade-in pb-4">
                 {/* Premium Card */}
                 <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl relative overflow-hidden shadow-2xl group">
                     {/* Glass effect overlays */}
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-colors duration-700"></div>
                     <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10 group-hover:bg-purple-500/20 transition-colors duration-700"></div>
                     
                     <div className="relative z-10">
                         <div className="flex justify-between items-start mb-8">
                             <div>
                                 <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Plano Atual</p>
                                 <h3 className="text-3xl font-bold text-white tracking-tight">Enterprise <span className="text-blue-500">PRO</span></h3>
                             </div>
                             <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold px-3 py-1 rounded-lg text-[10px] shadow-lg">
                                 ATIVO
                             </div>
                         </div>
                         
                         <div className="flex flex-wrap gap-2 mb-8">
                            <span className="text-[10px] text-slate-300 bg-slate-950/50 px-2 py-1 rounded border border-slate-700">50 Veículos</span>
                            <span className="text-[10px] text-slate-300 bg-slate-950/50 px-2 py-1 rounded border border-slate-700">IA Ilimitada</span>
                         </div>

                         <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                             <div>
                                 <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Valor Mensal</p>
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-slate-400">R$</span>
                                    <p className="text-white font-mono text-2xl font-bold">1.250</p>
                                    <span className="text-sm text-slate-500">,00</span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Payment Method */}
                 <div>
                    <div className="flex justify-between items-end mb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            Pagamento
                        </h4>
                        <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase">Novo</button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-white rounded flex items-center justify-center relative overflow-hidden shadow-sm">
                                <span className="relative z-10 text-[10px] font-extrabold text-blue-900 italic">VISA</span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Final 4242</p>
                                <p className="text-[10px] text-slate-500">Expira 12/28</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                 </div>
            </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4" onClick={onClose}>
        
        {/* Main Container - Fullscreen on mobile, Modal on desktop */}
        <div 
          className="bg-slate-950 w-full h-full md:max-w-5xl md:h-[85vh] md:rounded-3xl md:border md:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-300" 
          onClick={(e) => e.stopPropagation()}
        >
            {/* 1. SIDEBAR (Desktop) / TOP NAV (Mobile) */}
            
            {/* Mobile Header (Fixed Top) */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/95 backdrop-blur z-20 shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Perfil
                </h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleLogoutClick}
                        className="p-2 bg-red-900/20 rounded-full text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-72 bg-slate-900/50 border-r border-slate-800 flex-col shrink-0">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white">Configurações</h2>
                    <p className="text-slate-500 text-xs mt-1">Gerencie sua conta e preferências</p>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as TabType)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group relative overflow-hidden ${
                                activeTab === item.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                            <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className={`text-[10px] ${activeTab === item.id ? 'text-blue-100' : 'text-slate-600 group-hover:text-slate-500'}`}>{item.desc}</p>
                            </div>
                            {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full"></div>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair da Conta
                    </button>
                </div>
            </div>

            {/* Mobile Tabs (Fixed below header) */}
            <div className="md:hidden bg-slate-900/50 border-b border-slate-800 overflow-x-auto shrink-0 z-10 scrollbar-hide">
                <div className="flex p-2 gap-2 min-w-max">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as TabType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                                activeTab === item.id 
                                ? 'bg-blue-600 text-white shadow' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. CONTENT AREA (Scrollable) */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                             {navItems.find(i => i.id === activeTab)?.icon && React.createElement(navItems.find(i => i.id === activeTab)!.icon, { className: "w-5 h-5 text-blue-500" })}
                             {navItems.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-3xl mx-auto pb-20 md:pb-0">
                         {renderTabContent()}
                    </div>
                </div>

                {/* 3. FOOTER ACTIONS (Fixed Bottom) */}
                <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/90 backdrop-blur flex justify-between md:justify-end gap-3 z-20 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="flex-1 md:flex-none px-5 py-3 md:py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors font-medium border border-slate-800 text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={loading || saveSuccess}
                        className={`flex-1 md:flex-none px-6 py-3 md:py-2.5 rounded-xl text-white shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed min-w-[140px] text-sm ${
                            saveSuccess 
                            ? 'bg-green-600 shadow-green-900/20' 
                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 active:scale-95'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Salvando...</span>
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Salvo!</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Salvar Alterações</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
