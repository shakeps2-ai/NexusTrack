
import React, { useState, useEffect, useMemo } from 'react';
import { Alert, AlertType } from '../types';
import { 
  AlertTriangle, CheckCircle, Clock, Search, Filter, 
  MapPin, Settings, Shield, Zap, XCircle, ChevronDown,
  FileText, X, Check, Eye, Siren, FileDown, CheckCheck, Menu
} from 'lucide-react';

interface NotificationHistoryProps {
  alerts: Alert[];
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({ alerts }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para Modal de Detalhes
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info'} | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // OTIMIZAÇÃO: useMemo para evitar re-renderizações e loops de efeito.
  // Combina as props com um histórico simulado de forma estável.
  const allAlerts = useMemo(() => {
      const historyAlerts: Alert[] = [
        { id: 'h1', vehicleId: 'v1', type: AlertType.GEOFENCE, timestamp: 'Ontem, 14:30', severity: 'medium', resolved: true, description: 'Veículo entrou na zona de restrição' },
        { id: 'h2', vehicleId: 'v3', type: AlertType.SOS, timestamp: 'Ontem, 09:15', severity: 'high', resolved: true, description: 'BLOQUEIO ATIVADO: Veículo imobilizado manualmente' },
        { id: 'h3', vehicleId: 'v2', type: AlertType.SPEED, timestamp: '12/05/2024', severity: 'low', resolved: true, description: 'Velocidade de 110km/h detectada' },
        { id: 'h4', vehicleId: 'v4', type: AlertType.MAINTENANCE, timestamp: '10/05/2024', severity: 'medium', resolved: true, description: 'Manutenção preventiva agendada' },
      ];
      // Mescla garantindo que ids únicos das props tenham prioridade ou sejam adicionados
      return [...alerts, ...historyAlerts];
  }, [alerts]);

  // Limpar Toast automaticamente
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  // Lógica de Filtragem Otimizada
  const filteredAlerts = useMemo(() => {
      return allAlerts.filter(alert => {
        const matchesSearch = alert.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              alert.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || alert.type === filterType;
        const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
        return matchesSearch && matchesType && matchesSeverity;
      });
  }, [allAlerts, searchTerm, filterType, filterSeverity]);

  // Estatísticas
  const pendingCount = useMemo(() => allAlerts.filter(a => !a.resolved).length, [allAlerts]);
  const criticalPendingCount = useMemo(() => allAlerts.filter(a => !a.resolved && a.severity === 'high').length, [allAlerts]);

  // --- ACTIONS ---

  const handleExportCSV = () => {
    const headers = ["ID", "Veículo", "Tipo", "Severidade", "Data/Hora", "Status", "Descrição"];
    const rows = filteredAlerts.map(a => [
        a.id, a.vehicleId, a.type, a.severity, `"${a.timestamp}"`, a.resolved ? "Resolvido" : "Pendente", `"${a.description || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eventos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ msg: 'Relatório exportado.', type: 'success' });
    setIsFabOpen(false);
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getIcon = (type: AlertType) => {
    switch(type) {
      case AlertType.SPEED: return Zap;
      case AlertType.GEOFENCE: return MapPin;
      case AlertType.MAINTENANCE: return Settings;
      case AlertType.SOS: return Shield;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto animate-fade-in pb-24 md:pb-8 relative">
      {/* Toast */}
      {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
              <div className="px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border bg-blue-900/90 border-blue-500 text-blue-100 backdrop-blur-md">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">{toast.msg}</span>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-blue-500" /> Central de Eventos</h1>
           <p className="text-slate-400">Histórico completo de alertas.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Total</p>
             <p className="text-2xl font-bold text-white">{allAlerts.length}</p>
         </div>
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Críticos</p>
             <p className="text-2xl font-bold text-red-400">{allAlerts.filter(a => a.severity === 'high').length}</p>
         </div>
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Pendentes</p>
             <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
         </div>
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Resolvidos</p>
             <p className="text-2xl font-bold text-green-400">{allAlerts.filter(a => a.resolved).length}</p>
         </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500" />
         </div>
         <div className="flex gap-4">
             <div className="relative min-w-[160px]">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-8 py-2 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
                    <option value="all">Todos Tipos</option>
                    <option value={AlertType.SPEED}>Velocidade</option>
                    <option value={AlertType.GEOFENCE}>Cerca Virtual</option>
                    <option value={AlertType.MAINTENANCE}>Manutenção</option>
                    <option value={AlertType.SOS}>SOS</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
             </div>
         </div>
      </div>

      {/* Alerts List */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden mb-20">
          {filteredAlerts.length > 0 ? (
            <div className="divide-y divide-slate-800">
                {filteredAlerts.map((alert) => {
                    const Icon = getIcon(alert.type);
                    return (
                        <div key={alert.id} onClick={() => setSelectedAlert(alert)} className={`p-5 hover:bg-slate-800/40 transition-all flex items-center gap-4 cursor-pointer ${!alert.resolved ? 'bg-slate-900/50' : ''}`}>
                            <div className={`p-3 rounded-xl shrink-0 ${!alert.resolved ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-bold text-lg ${!alert.resolved ? 'text-white' : 'text-slate-300'}`}>{alert.type}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    {alert.description || `Veículo: ${alert.vehicleId}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-slate-500 text-sm"><Clock className="w-4 h-4" /> {alert.timestamp}</div>
                                <div className={`text-xs font-medium mt-1 ${alert.resolved ? 'text-green-400' : 'text-yellow-400'}`}>{alert.resolved ? 'Resolvido' : 'Pendente'}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Nenhum evento encontrado.</div>
          )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <button onClick={handleExportCSV} className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"><FileDown className="w-5 h-5" /></button>
          </div>
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 ${isFabOpen ? 'rotate-90' : 'rotate-0'}`}>
              {isFabOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
      </div>
    </div>
  );
};
