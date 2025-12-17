
import React, { useState } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Map, Truck, Users, Activity, LogOut, Database, Wifi, ToggleLeft, ToggleRight } from 'lucide-react';
import { traccarApi } from '../services/traccarApi';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, connectionStatus = 'connected' }) => {
  const [isSimulation, setIsSimulation] = useState(traccarApi.getSimulationMode());

  const toggleSimulation = () => {
      const newState = !isSimulation;
      setIsSimulation(newState);
      traccarApi.setSimulationMode(newState);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'map', label: 'Monitoramento', icon: Map },
    { id: 'fleet', label: 'Gestão de Frota', icon: Truck },
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'analytics', label: 'Nexus AI', icon: Activity },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-slate-950 border-r border-slate-800 flex-col h-full shadow-xl z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Truck className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          NexusTrack
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-md shadow-blue-900/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mode Toggle */}
      <div className="px-6 pb-2">
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Fonte de Dados</span>
                  <button onClick={toggleSimulation} className="text-blue-500 hover:text-blue-400 transition-colors">
                      {isSimulation ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                  </button>
              </div>
              <p className={`text-xs font-medium ${isSimulation ? 'text-yellow-500' : 'text-green-500'}`}>
                  {isSimulation ? 'Simulação Ativa' : 'Dados Reais (API)'}
              </p>
          </div>
      </div>

      {/* Connection Status Indicator */}
      <div className="px-6 py-4">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              connectionStatus === 'connected' 
              ? 'bg-green-900/10 border-green-500/20 text-green-400' 
              : connectionStatus === 'checking'
              ? 'bg-yellow-900/10 border-yellow-500/20 text-yellow-400'
              : 'bg-red-900/10 border-red-500/20 text-red-400'
          }`}>
              <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  {connectionStatus === 'connected' && <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"></div>}
              </div>
              <span>
                  {connectionStatus === 'connected' ? 'Banco de Dados: Online' : connectionStatus === 'checking' ? 'Verificando...' : 'Offline'}
              </span>
          </div>
      </div>

      <div className="p-4 border-t border-slate-900">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};
