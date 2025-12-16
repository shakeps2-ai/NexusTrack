
import React, { useState, useEffect } from 'react';
import { Vehicle, Alert, VehicleStatus, AlertType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  AlertTriangle, Fuel, Activity, Clock, Plus, FileText, Map, 
  Zap, ChevronRight, TrendingUp, Download, Calendar, UserPlus, Shield, CheckCircle
} from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  alerts: Alert[];
  onQuickAction: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ vehicles, alerts, onQuickAction }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'alert'} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Limpar Toast
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  const activeVehicles = vehicles.filter(v => v.status === VehicleStatus.MOVING).length;
  const totalVehicles = vehicles.length;
  const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.maintenance).length;
  
  // Data for charts
  const statusData = [
    { name: 'Em Movimento', value: activeVehicles, color: '#3b82f6' },
    { name: 'Parado', value: vehicles.filter(v => v.status === VehicleStatus.STOPPED).length, color: '#eab308' },
    { name: 'Offline', value: vehicles.filter(v => v.status === VehicleStatus.OFFLINE).length, color: '#64748b' },
    { name: 'Manutenção', value: maintenanceVehicles, color: '#ef4444' },
  ];

  const fuelData = vehicles.map(v => ({
    name: v.plate,
    fuel: v.fuelLevel
  }));

  const handleGenerateReport = () => {
    const headers = ["ID", "Modelo", "Placa", "Status", "Combustível %", "Velocidade", "Localização"];
    const rows = vehicles.map(v => [
        v.id,
        v.model,
        v.plate,
        v.status,
        v.fuelLevel,
        v.speed,
        `"${v.location.lat}, ${v.location.lng}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_geral_frota_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ msg: 'Relatório geral exportado com sucesso!', type: 'success' });
  };

  const QuickActionButton = ({ icon: Icon, label, desc, colorClass, onClick }: any) => (
    <button 
      onClick={onClick}
      className="group relative overflow-hidden bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all duration-300 text-left w-full shadow-lg hover:shadow-xl active:scale-95"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 transition-transform group-hover:scale-150 ${colorClass}`}></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className={`p-3 rounded-xl w-fit mb-3 transition-colors ${colorClass.replace('bg-', 'bg-opacity-20 text-').replace('text-', '')} bg-opacity-20`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{label}</h3>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
      </div>
      <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in overflow-y-auto h-full custom-scrollbar pb-24 md:pb-8 relative">
      
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
              <div className="px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border bg-green-900/90 border-green-500 text-green-100 backdrop-blur-md">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">{toast.msg}</span>
              </div>
          </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-500/20">
                Visão Geral
              </span>
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
             Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Administrador</span>
           </h1>
           <p className="text-slate-400 mt-2">Aqui está o resumo da operação da sua frota hoje.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 text-sm font-medium shadow-sm">
           <Calendar className="w-4 h-4 text-blue-500" />
           {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
           <span className="w-1 h-1 bg-slate-600 rounded-full mx-1"></span>
           {currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      {/* --- QUICK ACTIONS --- */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton 
            icon={Plus} 
            label="Novo Veículo" 
            desc="Cadastrar na frota" 
            colorClass="bg-blue-600 text-blue-500" 
            onClick={() => onQuickAction('add_vehicle')}
          />
          <QuickActionButton 
            icon={UserPlus} 
            label="Motorista" 
            desc="Adicionar funcionário" 
            colorClass="bg-purple-600 text-purple-500" 
            onClick={() => onQuickAction('add_driver')}
          />
          <QuickActionButton 
            icon={FileText} 
            label="Relatório" 
            desc="Exportar dados (CSV)" 
            colorClass="bg-green-600 text-green-500" 
            onClick={handleGenerateReport}
          />
          <QuickActionButton 
            icon={Map} 
            label="Mapa Ao Vivo" 
            desc="Monitoramento real" 
            colorClass="bg-orange-600 text-orange-500" 
            onClick={() => onQuickAction('map')}
          />
        </div>
      </section>

      {/* --- KPI STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Activity className="w-16 h-16" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Activity className="text-blue-500 w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
              <TrendingUp className="w-3 h-3" /> +2.5%
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Veículos Ativos</h3>
          <p className="text-3xl font-bold text-white mt-1">{activeVehicles}<span className="text-slate-600 text-xl font-medium">/{totalVehicles}</span></p>
          <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(activeVehicles/totalVehicles)*100}%` }}></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <AlertTriangle className="w-16 h-16 text-yellow-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <AlertTriangle className="text-yellow-500 w-6 h-6" />
            </div>
            {alerts.filter(a => !a.resolved).length > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20 animate-pulse">
                Ação Necessária
                </span>
            )}
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Alertas Pendentes</h3>
          <p className="text-3xl font-bold text-white mt-1">{alerts.filter(a => !a.resolved).length}</p>
          <p className="text-xs text-slate-500 mt-2">Requer atenção da equipe</p>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Fuel className="text-green-500 w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Média Combustível</h3>
          <p className="text-3xl font-bold text-white mt-1">
            {Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / (totalVehicles || 1))}%
          </p>
          <p className="text-xs text-slate-500 mt-2">Eficiência da frota: Alta</p>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Clock className="text-purple-500 w-6 h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide">Tempo em Rota</h3>
          <p className="text-3xl font-bold text-white mt-1">4h 12m</p>
          <p className="text-xs text-slate-500 mt-2">Média por veículo hoje</p>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-lg font-bold text-white">Status da Frota</h2>
                <p className="text-slate-500 text-xs">Distribuição atual dos veículos</p>
             </div>
             <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
             </button>
          </div>
          
          <div className="h-[250px] md:h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text for Donut */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-3xl font-bold text-white">{totalVehicles}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }} />
                <div className="flex-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300 font-medium">{item.name}</span>
                        <span className="text-white font-bold">{item.value}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(item.value/totalVehicles)*100}%`, backgroundColor: item.color }}></div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="text-lg font-bold text-white">Nível de Combustível</h2>
                <p className="text-slate-500 text-xs">Análise por veículo (%)</p>
             </div>
             <button onClick={handleGenerateReport} className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                Ver Relatório
             </button>
          </div>

          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                />
                <YAxis 
                    stroke="#64748b" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false}
                    dx={-10} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                />
                <Bar dataKey="fuel" radius={[4, 4, 0, 0]}>
                  {fuelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fuel < 20 ? '#ef4444' : entry.fuel < 50 ? '#eab308' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                      <p className="text-sm font-bold text-white">Nível Crítico</p>
                      <p className="text-xs text-slate-500">{fuelData.filter(f => f.fuel < 20).length} veículos abaixo de 20%</p>
                  </div>
              </div>
              <button className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700">Ver Lista</button>
          </div>
        </div>
      </div>
      
      {/* --- RECENT ALERTS (FEED STYLE) --- */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-lg font-bold text-white">Atividades Recentes</h2>
                <p className="text-slate-500 text-xs">Feed de eventos em tempo real</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Live Update <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-1 animate-pulse"></span></span>
        </div>
        
        <div className="space-y-3">
            {alerts.slice(0, 4).map((alert, idx) => (
                <div key={alert.id} className="group flex items-center gap-4 p-4 bg-slate-950/50 hover:bg-slate-900 border border-slate-800/50 hover:border-blue-500/30 rounded-2xl transition-all duration-300">
                    <div className={`p-3 rounded-xl shrink-0 ${
                         alert.type === AlertType.SPEED ? 'bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                         alert.type === AlertType.MAINTENANCE ? 'bg-yellow-500/10 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                         'bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    }`}>
                         {alert.type === AlertType.SPEED ? <Zap className="w-5 h-5" /> : 
                          alert.type === AlertType.MAINTENANCE ? <AlertTriangle className="w-5 h-5" /> : 
                          <Shield className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{alert.type}</h4>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{alert.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">Veículo:</span>
                            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-1.5 rounded">{vehicles.find(v => v.id === alert.vehicleId)?.plate || 'N/A'}</span>
                            <span className="text-slate-600 text-[10px] mx-1">•</span>
                            <span className={`text-[10px] font-bold uppercase ${
                                alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                                Prioridade {alert.severity}
                            </span>
                        </div>
                    </div>
                    
                    <button className="p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
