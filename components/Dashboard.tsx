import React from 'react';
import { Vehicle, Alert, VehicleStatus, AlertType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { AlertTriangle, Fuel, Activity, Clock } from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  alerts: Alert[];
}

export const Dashboard: React.FC<DashboardProps> = ({ vehicles, alerts }) => {
  const activeVehicles = vehicles.filter(v => v.status === VehicleStatus.MOVING).length;
  const totalVehicles = vehicles.length;
  
  // Data for charts
  const statusData = [
    { name: 'Movimento', value: activeVehicles, color: '#3b82f6' },
    { name: 'Parado', value: vehicles.filter(v => v.status === VehicleStatus.STOPPED).length, color: '#eab308' },
    { name: 'Offline', value: vehicles.filter(v => v.status === VehicleStatus.OFFLINE).length, color: '#64748b' },
  ];

  const fuelData = vehicles.map(v => ({
    name: v.plate,
    fuel: v.fuelLevel
  }));

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-in overflow-y-auto h-full">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Painel de Controle</h1>
        <p className="text-slate-400 text-sm md:text-base">Visão geral da operação em tempo real.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg">
              <Activity className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="hidden md:inline text-xs font-semibold px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">+2.5%</span>
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Veículos Ativos</h3>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{activeVehicles}/{totalVehicles}</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="hidden md:inline text-xs font-semibold px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">{alerts.filter(a => !a.resolved).length} Novos</span>
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Alertas</h3>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{alerts.filter(a => !a.resolved).length}</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-green-500/10 rounded-lg">
              <Fuel className="text-green-500 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Combustível</h3>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">
            {Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / totalVehicles)}%
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-purple-500/10 rounded-lg">
              <Clock className="text-purple-500 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium">Tempo Médio</h3>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">4h 12m</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <h2 className="text-base md:text-lg font-semibold text-white mb-6">Status da Frota</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 md:gap-6 mt-4 flex-wrap">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs md:text-sm text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
          <h2 className="text-base md:text-lg font-semibold text-white mb-6">Nível de Combustível</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                />
                <Bar dataKey="fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Alerts List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm pb-20 md:pb-6">
        <h2 className="text-base md:text-lg font-semibold text-white mb-4">Alertas Recentes</h2>
        <div className="space-y-4">
            {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 gap-3 sm:gap-0">
                    <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-full ${
                             alert.type === AlertType.SPEED ? 'bg-red-500/20 text-red-500' :
                             alert.type === AlertType.MAINTENANCE ? 'bg-yellow-500/20 text-yellow-500' :
                             'bg-blue-500/20 text-blue-500'
                         }`}>
                             <AlertTriangle className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-white font-medium text-sm md:text-base">{alert.type}</p>
                             <p className="text-xs md:text-sm text-slate-400">Veículo: {vehicles.find(v => v.id === alert.vehicleId)?.plate || 'N/A'}</p>
                         </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-slate-800 sm:border-0 pt-2 sm:pt-0">
                        <p className="text-xs md:text-sm text-slate-400 sm:mb-1">{alert.timestamp}</p>
                        <span className={`text-[10px] md:text-xs px-2 py-1 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {alert.severity.toUpperCase()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};