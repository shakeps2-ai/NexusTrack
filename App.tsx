
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
import { LandingPage } from './components/LandingPage';
import { ViewState, Vehicle, VehicleStatus, Alert, AlertType } from './types';
import { MOCK_DRIVERS, MOCK_ALERTS } from './constants';
import { Bell, User, Server, LogIn, Loader2, LogOut, UserPlus, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { traccarApi } from './services/traccarApi';

const App: React.FC = () => {
  // Navigation
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  
  // Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

  // Auth & Connection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  const [loginForm, setLoginForm] = useState({ name: '', email: '', password: '' });
  const [userProfile, setUserProfile] = useState({ name: 'Administrador', email: '', phone: '(11) 99999-9999', company: 'Minha Frota', avatar: '' });

  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- HELPER DE NOTIFICAÇÃO ---
  const createSystemAlert = (vehicleId: string, type: AlertType, severity: 'low' | 'medium' | 'high', resolved: boolean = false, description?: string) => {
    const newAlert: Alert = {
        id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vehicleId,
        type,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        severity,
        resolved,
        description
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // --- CHECK SESSION ON MOUNT ---
  // Verifica se já existe um usuário logado no Supabase ao abrir o app
  useEffect(() => {
    const checkSession = async () => {
        const response = await traccarApi.getCurrentUser();
        if (response.success && response.user) {
            setUserProfile(prev => ({ 
                ...prev, 
                email: response.user!.email, 
                name: response.user!.name 
            }));
            setIsAuthenticated(true);
            setShowLanding(false);
        }
    };
    checkSession();
  }, []);

  // --- DATA ENGINE PREMIUM (REALTIME) ---
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // 1. Carga Inicial
    const loadInitialData = async () => {
        try {
            const isConnected = await traccarApi.checkConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');

            if (isConnected) {
                const data = await traccarApi.getDevices();
                if (data) setVehicles(data);
            }
        } catch (e) {
            setConnectionStatus('disconnected');
        }
    };
    loadInitialData();

    // 2. Inscrição em Tempo Real (Websocket)
    // Ouve mudanças diretamente do banco de dados (Insert/Update/Delete)
    const subscription = traccarApi.subscribeToUpdates((payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new) {
                setVehicles(prev => {
                    const index = prev.findIndex(v => v.id === payload.new!.id);
                    if (index >= 0) {
                        // Update eficiente
                        const newArr = [...prev];
                        newArr[index] = payload.new!;
                        return newArr;
                    } else {
                        // Insert
                        return [...prev, payload.new!];
                    }
                });

                // Verificação de Alertas em Tempo Real
                const v = payload.new;
                if (v.speed > 100) {
                    setAlerts(prev => {
                        const hasPending = prev.some(a => a.vehicleId === v.id && a.type === AlertType.SPEED && !a.resolved);
                        if (!hasPending) {
                            return [{
                                id: `rt-spd-${Date.now()}`,
                                vehicleId: v.id,
                                type: AlertType.SPEED,
                                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                                severity: 'high',
                                resolved: false,
                                description: `Velocidade detectada: ${v.speed} km/h (Limite: 100 km/h)`
                            }, ...prev];
                        }
                        return prev;
                    });
                }
            }
        } else if (payload.eventType === 'DELETE') {
            if (payload.old?.id) {
                setVehicles(prev => prev.filter(v => v.id !== payload.old!.id));
            }
        }
    });

    // 3. Loop de Simulação (Escrita Apenas)
    // Se o modo simulação estiver ativo, gera dados e escreve no banco.
    // O banco dispara o evento Realtime, que atualiza a UI acima.
    // Isso garante que o fluxo seja sempre DB -> UI, mesmo na simulação.
    const interval = setInterval(() => {
        traccarApi.simulateMovement();
    }, 3000); 

    return () => {
        subscription.unsubscribe();
        clearInterval(interval);
    };
  }, [isAuthenticated]);

  // --- HANDLERS ---
  
  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsConnecting(true);
      setAuthError(null);

      try {
        // Fix: Removed first empty parameter from register and login calls
        const res = isRegistering 
            ? await traccarApi.register(loginForm.name, loginForm.email, loginForm.password)
            : await traccarApi.login(loginForm.email, loginForm.password);

        if (res.success) {
            if (isRegistering) {
                // Se o registro exigir confirmação de email, avise o usuário
                setIsRegistering(false);
                setAuthError("Conta criada! Verifique seu email ou faça login.");
            } else {
                setIsAuthenticated(true);
                setShowLanding(false);
                if (res.user) setUserProfile(prev => ({ ...prev, email: res.user!.email, name: res.user!.name }));
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

  const handleCreateAdmin = async () => {
      setIsConnecting(true);
      setAuthError(null);
      try {
          const res = await traccarApi.createDefaultAdmin();
          
          // Preenche o formulário automaticamente para facilitar
          setLoginForm({
              name: 'Administrador Global',
              email: 'admin@nexustrack.com',
              password: 'admin123'
          });

          if (res.success) {
              if (res.user) setUserProfile(prev => ({ ...prev, email: res.user!.email, name: res.user!.name }));
              // Pequeno delay para mostrar que funcionou antes de entrar
              setAuthError('Admin configurado! Entrando...');
              setTimeout(() => {
                  setIsAuthenticated(true);
                  setShowLanding(false);
              }, 1000);
          } else {
              setAuthError(res.error || "Erro ao criar admin.");
          }
      } catch (e) {
          setAuthError("Erro de conexão ao criar admin.");
      } finally {
          setIsConnecting(false);
      }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleMarkAllRead = () => {
      setAlerts(prev => prev.map(a => ({ ...a, resolved: true })));
  };

  const handleClearNotifications = () => {
      if (confirm('Tem certeza que deseja limpar todo o histórico de notificações?')) {
          setAlerts([]);
      }
  };

  const handleDismissNotification = (id: string) => {
      setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // --- CRUD WRAPPERS ---
  const handleAddVehicle = async (newVehicle: Omit<Vehicle, 'id'>) => {
      const tempId = `v-${Date.now()}`;
      const payload = { ...newVehicle, id: tempId };
      await traccarApi.addDevice(payload);
      // setVehicles removido daqui, pois o Realtime atualizará a UI automaticamente
      createSystemAlert(tempId, AlertType.MAINTENANCE, 'low', true, 'Novo veículo adicionado à frota.'); // Log de criação
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
      await traccarApi.addDevice(updatedVehicle);
      // setVehicles removido, realtime cuida disso
  };

  const handleDeleteVehicle = async (id: string) => {
      await traccarApi.deleteDevice(id);
      // setVehicles removido, realtime cuida disso
  };
  
  const handleToggleLock = async (id: string) => {
    // Captura estado antes da mudança para gerar notificação correta
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    
    const isLocking = !vehicle.isLocked; // Se não estava bloqueado, a ação é bloquear

    await traccarApi.toggleLock(id);
    // UI será atualizada pelo Realtime, mas a notificação é gerada aqui para feedback imediato
    
    // GERA NOTIFICAÇÃO DE AÇÃO COM TEXTO ESPECÍFICO
    const actionDescription = isLocking 
        ? `BLOQUEIO ATIVADO: Veículo ${vehicle.plate} foi imobilizado remotamente.` 
        : `DESBLOQUEIO REALIZADO: Veículo ${vehicle.plate} liberado para operação.`;

    createSystemAlert(
        id, 
        AlertType.SOS, // Classifica bloqueio como evento de segurança/SOS
        isLocking ? 'high' : 'medium',
        !isLocking, // Se desbloqueou, já nasce resolvido. Se bloqueou, fica pendente atenção.
        actionDescription
    );
  };
  
  const handleUpdateGeofence = (id: string, active: boolean, radius: number) => {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, geofenceActive: active, geofenceRadius: radius } : v));
      
      const desc = active 
        ? `Cerca Virtual ATIVADA (Raio: ${radius}m)` 
        : `Cerca Virtual DESATIVADA`;

      // GERA NOTIFICAÇÃO DE CERCA VIRTUAL
      createSystemAlert(
          id,
          AlertType.GEOFENCE,
          'low',
          true, // Apenas informativo
          desc
      );
  };

  const handleLogout = async () => {
    await traccarApi.logout();
    setIsAuthenticated(false);
    setVehicles([]);
    setShowLogoutConfirm(false);
    setShowLanding(true);
    // Limpa form ao sair
    setLoginForm({ name: '', email: '', password: '' });
  };

  const handleQuickAction = (action: string) => {
      const actions: Record<string, () => void> = {
          'add_vehicle': () => { setCurrentView('fleet'); setPendingAction('open_add_vehicle'); },
          'add_driver': () => { setCurrentView('employees'); setPendingAction('open_add_driver'); },
          'map': () => setCurrentView('map'),
          'view_fleet': () => setCurrentView('fleet'),
          'view_alerts': () => setCurrentView('notifications')
      };
      if (actions[action]) actions[action]();
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard vehicles={vehicles} alerts={alerts} onQuickAction={handleQuickAction} />;
      case 'map': return <MapTracker vehicles={vehicles} onToggleLock={handleToggleLock} />;
      case 'fleet': return <FleetManager vehicles={vehicles} drivers={drivers} onAddVehicle={handleAddVehicle} onUpdateVehicle={handleUpdateVehicle} onDeleteVehicle={handleDeleteVehicle} onToggleLock={handleToggleLock} onUpdateGeofence={handleUpdateGeofence} initialAction={pendingAction} onClearAction={() => setPendingAction(null)} />;
      case 'employees': return <EmployeeList drivers={drivers} vehicles={vehicles} onAddDriver={(d)=>{setDrivers(p=>[...p,{...d,id:`d${Date.now()}`,rating:5}])}} onUpdateDriver={(d)=>{setDrivers(p=>p.map(x=>x.id===d.id?d:x))}} onDeleteDriver={(id)=>{setDrivers(p=>p.filter(x=>x.id!==id))}} initialAction={pendingAction} onClearAction={() => setPendingAction(null)} />;
      case 'analytics': return <AIAnalyst vehicles={vehicles} drivers={drivers} alerts={alerts} />;
      case 'notifications': return <NotificationHistory alerts={alerts} />;
      default: return null;
    }
  };

  if (!isAuthenticated && showLanding) return <LandingPage onEnterApp={(reg) => { setIsRegistering(!!reg); setShowLanding(false); setAuthError(null); }} />;

  if (!isAuthenticated) {
      return (
          <div className="h-screen overflow-y-auto bg-slate-950 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-auto">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10 mb-6">
                      <button onClick={() => setShowLanding(true)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Voltar ao Site</button>
                  </div>
                  <div className="flex flex-col items-center mb-8 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4"><Server className="w-8 h-8 text-white" /></div>
                      <h1 className="text-2xl font-bold text-white">NexusTrack <span className="text-blue-500">Premium</span></h1>
                      <p className="text-slate-400 text-sm mt-2">{isRegistering ? 'Crie sua conta empresarial' : 'Plataforma Inteligente de Gestão'}</p>
                  </div>
                  {authError && <div className={`mb-4 p-3 rounded-lg text-sm text-center relative z-10 flex items-center justify-center gap-2 ${authError.includes('configurado') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                      {authError.includes('configurado') && <CheckCircle className="w-4 h-4" />}
                      {authError}
                  </div>}
                  <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                      {isRegistering && (
                          <div className="space-y-1 animate-in slide-in-from-left-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                              <input type="text" required={isRegistering} placeholder="Seu nome" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                          </div>
                      )}
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                          <input type="text" required placeholder="admin@nexustrack.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                          <input type="password" required placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                      </div>
                      
                      {/* BOTAO PRINCIPAL DE LOGIN */}
                      <button type="submit" disabled={isConnecting} className={`w-full font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 ${isRegistering ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                          {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                          {isConnecting ? 'Acessando...' : (isRegistering ? 'Criar Conta' : 'Entrar na Plataforma')}
                      </button>

                      <div className="text-center pt-2 space-y-3">
                          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="text-sm text-slate-500 hover:text-blue-400 transition-colors">{isRegistering ? "Já tem uma conta? Faça Login" : "Não tem conta? Crie uma grátis"}</button>
                          
                          {/* BOTAO PARA CRIAR ADMIN PADRAO (SETUP) */}
                          {!isRegistering && (
                              <button type="button" onClick={handleCreateAdmin} className="w-full text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 py-2 border border-dashed border-slate-800 hover:border-blue-500/50 rounded-lg">
                                  <ShieldCheck className="w-3 h-3" /> Configurar Admin Padrão
                              </button>
                          )}
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={() => setShowLogoutConfirm(true)} connectionStatus={connectionStatus} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur z-10 flex items-center justify-between px-4 md:px-8 relative">
           <div className="flex items-center text-slate-400 text-sm">
             <div className="md:hidden mr-3 p-2 bg-blue-600/10 rounded-lg text-blue-500"><span className="font-bold">NT</span></div>
             <span className="opacity-50 hidden md:inline">NexusTrack</span><span className="mx-2 hidden md:inline">/</span>
             <span className="text-white font-medium capitalize">{currentView}</span>
           </div>
           <div className="flex items-center gap-4 md:gap-6">
                <div className="relative">
                    <button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }} className="relative text-slate-400 hover:text-white transition-colors p-2">
                        <Bell className="w-5 h-5" />
                        {alerts.filter(a => !a.resolved).length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </button>
                    <NotificationPanel 
                        isOpen={isNotificationsOpen} 
                        onClose={() => setIsNotificationsOpen(false)} 
                        alerts={alerts} 
                        onViewHistory={() => setCurrentView('notifications')}
                        onMarkAllRead={handleMarkAllRead}
                        onClearAll={handleClearNotifications}
                        onDismiss={handleDismissNotification}
                    />
                </div>
                <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-800">
                    <div className="text-right hidden sm:block"><p className="text-sm font-medium text-white">{userProfile.name}</p><p className="text-xs text-slate-500">Online</p></div>
                    <button 
                        onClick={() => { setIsProfileOpen(true); setIsNotificationsOpen(false); }} 
                        className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 hover:border-blue-500 transition-colors overflow-hidden"
                    >
                        {userProfile.avatar ? (
                            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-slate-400" />
                        )}
                    </button>
                </div>
           </div>
        </header>
        <main className="flex-1 overflow-hidden relative pb-[80px] md:pb-0">{renderContent()}</main>
        <MobileNav currentView={currentView} onChangeView={setCurrentView} />
      </div>
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={() => setShowLogoutConfirm(true)} currentUser={userProfile} onUpdateProfile={(d) => setUserProfile(p => ({ ...p, ...d }))} />
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 w-full max-sm rounded-2xl shadow-2xl p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto"><LogOut className="w-8 h-8 text-red-500" /></div>
                <h3 className="text-xl font-bold text-white mb-2">Encerrar Sessão?</h3>
                <div className="flex gap-3 w-full mt-6">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300">Cancelar</button>
                    <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold">Sair Agora</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
