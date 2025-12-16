import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { MapTracker } from './components/MapTracker';
import { FleetManager } from './components/FleetManager';
import { EmployeeList } from './components/EmployeeList';
import { AIAnalyst } from './components/AIAnalyst';
import { UserProfile } from './components/UserProfile';
import { NotificationPanel } from './components/NotificationPanel';
import { NotificationHistory } from './components/NotificationHistory';
import { ViewState, Driver, Vehicle, VehicleStatus } from './types';
import { MOCK_DRIVERS, MOCK_ALERTS } from './constants';
import { Bell, User, Server, LogIn, Loader2, PlayCircle, LogOut, UserPlus, ShieldCheck } from 'lucide-react';
import { traccarApi } from './services/traccarApi';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [loginForm, setLoginForm] = useState({
      name: '', 
      email: '',
      password: ''
  });

  const [userProfile, setUserProfile] = useState({
      name: 'Administrador',
      email: '',
      phone: '(11) 99999-9999',
      company: 'Minha Frota'
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- MOCK DATA ENGINE ---
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
        const data = await traccarApi.getDevices();
        if (data && data.length > 0) {
            setVehicles([...data]);
        }
    };

    fetchData();

    // Simulação de movimento em tempo real (Mock)
    const interval = setInterval(() => {
        // @ts-ignore - Método específico do Mock Service
        if (typeof traccarApi.simulateMovement === 'function') {
            // @ts-ignore
            traccarApi.simulateMovement();
        }
        fetchData();
    }, 2000); // Atualiza a cada 2 segundos para dar sensação de tempo real

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // --- HANDLERS ---

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsConnecting(true);
      setAuthError(null);

      try {
        // Simulação de delay para parecer real
        const res = isRegistering 
            ? await traccarApi.register('', loginForm.name, loginForm.email, loginForm.password)
            : await traccarApi.login('', loginForm.email, loginForm.password);

        if (res.success) {
            if (isRegistering) {
                setIsRegistering(false);
                setAuthError("Conta criada! Faça login.");
            } else {
                setIsAuthenticated(true);
                if (res.user) {
                    setUserProfile(prev => ({ 
                        ...prev, 
                        email: res.user.email, 
                        name: res.user.name 
                    }));
                }
            }
        } else {
            setAuthError(res.error || "Erro de autenticação");
        }
      } catch (err) {
          setAuthError("Erro de conexão.");
      } finally {
          setIsConnecting(false);
      }
  };

  const handleAddVehicle = async (newVehicle: Omit<Vehicle, 'id'>) => {
      const tempId = `v-${Date.now()}`;
      const payload = { ...newVehicle, id: tempId };
      await traccarApi.addDevice(payload);
      setVehicles(prev => [...prev, payload as Vehicle]);
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
      await traccarApi.addDevice(updatedVehicle);
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const handleDeleteVehicle = async (id: string) => {
      await traccarApi.deleteDevice(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
  };
  
  const handleToggleLock = async (id: string) => {
    await traccarApi.toggleLock(id);
    setVehicles(prev => prev.map(v => v.id === id ? { 
        ...v, 
        isLocked: !v.isLocked, 
        status: !v.isLocked ? VehicleStatus.STOPPED : v.status 
    } : v));
  };
  
  const handleUpdateGeofence = (id: string, active: boolean, radius: number) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, geofenceActive: active, geofenceRadius: radius } : v));

  // --- RENDER ---
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard vehicles={vehicles} alerts={alerts} />;
      case 'map': return <MapTracker vehicles={vehicles} onToggleLock={handleToggleLock} />;
      case 'fleet': return <FleetManager vehicles={vehicles} drivers={drivers} onAddVehicle={handleAddVehicle} onUpdateVehicle={handleUpdateVehicle} onDeleteVehicle={handleDeleteVehicle} onToggleLock={handleToggleLock} onUpdateGeofence={handleUpdateGeofence} />;
      case 'employees': return <EmployeeList drivers={drivers} vehicles={vehicles} onAddDriver={(d)=>{setDrivers(p=>[...p,{...d,id:`d${Date.now()}`,rating:5}])}} onUpdateDriver={(d)=>{setDrivers(p=>p.map(x=>x.id===d.id?d:x))}} onDeleteDriver={(id)=>{setDrivers(p=>p.filter(x=>x.id!==id))}} />;
      case 'analytics': return <AIAnalyst vehicles={vehicles} drivers={drivers} alerts={alerts} />;
      case 'notifications': return <NotificationHistory alerts={alerts} />;
      default: return <Dashboard vehicles={vehicles} alerts={alerts} />;
    }
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  
                  <div className="flex flex-col items-center mb-8 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4">
                          <Server className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">NexusTrack <span className="text-blue-500">Premium</span></h1>
                      <p className="text-slate-400 text-sm mt-2">Plataforma Inteligente de Gestão</p>
                  </div>

                  {authError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center relative z-10">
                          {authError}
                      </div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                      
                      {isRegistering && (
                          <div className="space-y-1 animate-in slide-in-from-left-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                              <input type="text" required={isRegistering} placeholder="Seu nome" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                          </div>
                      )}

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                          <input type="text" required placeholder="admin@empresa.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                          <input type="password" required placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                      </div>

                      <button type="submit" disabled={isConnecting} className={`w-full font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 ${isRegistering ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                          {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                          {isConnecting ? 'Acessando...' : (isRegistering ? 'Criar Conta' : 'Entrar na Plataforma')}
                      </button>

                      <div className="text-center pt-2">
                          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
                              {isRegistering ? "Já tem uma conta? Faça Login" : "Não tem conta? Crie uma grátis"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={() => setShowLogoutConfirm(true)} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-10 flex items-center justify-between px-4 md:px-8 relative">
           <div className="flex items-center text-slate-400 text-sm">
             <div className="md:hidden mr-3 p-2 bg-blue-600/10 rounded-lg text-blue-500"><span className="font-bold">NT</span></div>
             <span className="opacity-50 hidden md:inline">NexusTrack</span><span className="mx-2 hidden md:inline">/</span>
             <span className="text-white font-medium capitalize">{currentView}</span>
           </div>
           <div className="flex items-center gap-4 md:gap-6">
                <div className="relative"><button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }} className="relative text-slate-400 hover:text-white transition-colors p-2"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span></button><NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} alerts={alerts} onViewHistory={() => setCurrentView('notifications')} /></div>
                <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-800">
                    <div className="text-right hidden sm:block"><p className="text-sm font-medium text-white">{userProfile.name}</p><p className="text-xs text-slate-500">Online</p></div>
                    <button onClick={() => { setIsProfileOpen(true); setIsNotificationsOpen(false); }} className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 hover:border-blue-500 transition-colors"><User className="w-5 h-5 text-slate-400" /></button>
                </div>
           </div>
        </header>
        <main className="flex-1 overflow-hidden relative pb-[80px] md:pb-0">{renderContent()}</main>
        <MobileNav currentView={currentView} onChangeView={setCurrentView} />
      </div>
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={() => setShowLogoutConfirm(true)} currentUser={userProfile} onUpdateProfile={(d) => setUserProfile(p => ({ ...p, ...d }))} />
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto"><LogOut className="w-8 h-8 text-red-500" /></div>
                <h3 className="text-xl font-bold text-white mb-2">Encerrar Sessão?</h3>
                <div className="flex gap-3 w-full mt-6">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                    <button onClick={() => { setIsAuthenticated(false); setVehicles([]); setShowLogoutConfirm(false); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold">Sair Agora</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;