import React, { useState, useEffect } from 'react';
import { Alert, AlertType } from '../types';
import { 
  AlertTriangle, CheckCircle, Clock, Search, Filter, 
  MapPin, Settings, Shield, Zap, XCircle, ChevronDown, Download,
  FileText, X, Check, Eye, Siren, MoreVertical, FileDown, CheckCheck, Menu
} from 'lucide-react';

interface NotificationHistoryProps {
  alerts: Alert[];
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({ alerts }) => {
  // Inicialização do estado com dados combinados (Props + Mock Histórico)
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para Modal de Detalhes
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  // Estado para Feedback (Toast)
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info'} | null>(null);

  // Estado para o Botão de Ação Rápida (FAB)
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    // Simulando carregamento de histórico antigo misturado com props atuais
    const historyAlerts: Alert[] = [
        ...alerts,
        { id: 'h1', vehicleId: 'v1', type: AlertType.GEOFENCE, timestamp: 'Ontem, 14:30', severity: 'medium', resolved: true },
        { id: 'h2', vehicleId: 'v3', type: AlertType.SOS, timestamp: 'Ontem, 09:15', severity: 'high', resolved: true },
        { id: 'h3', vehicleId: 'v2', type: AlertType.SPEED, timestamp: '12/05/2024', severity: 'low', resolved: true },
        { id: 'h4', vehicleId: 'v4', type: AlertType.MAINTENANCE, timestamp: '10/05/2024', severity: 'medium', resolved: true },
        { id: 'h5', vehicleId: 'v1', type: AlertType.SPEED, timestamp: '08/05/2024', severity: 'high', resolved: true },
        { id: 'h6', vehicleId: 'v2', type: AlertType.GEOFENCE, timestamp: '05/05/2024', severity: 'medium', resolved: true },
      ];
      setAllAlerts(historyAlerts);
  }, [alerts]);

  // Limpar Toast automaticamente
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  // Lógica de Filtragem
  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = alert.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Estatísticas para o Banner
  const pendingCount = allAlerts.filter(a => !a.resolved).length;
  const criticalPendingCount = allAlerts.filter(a => !a.resolved && a.severity === 'high').length;

  // --- FUNÇÕES DE AÇÃO ---

  const handleExportCSV = () => {
    // Cabeçalho CSV
    const headers = ["ID", "Veículo", "Tipo", "Severidade", "Data/Hora", "Status"];
    
    // Linhas CSV
    const rows = filteredAlerts.map(a => [
        a.id,
        a.vehicleId,
        a.type,
        a.severity,
        `"${a.timestamp}"`, // Aspas para evitar quebra em datas com vírgula
        a.resolved ? "Resolvido" : "Pendente"
    ]);

    // Montar conteúdo
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    // Criar link de download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_eventos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ msg: 'Relatório exportado com sucesso!', type: 'success' });
    setIsFabOpen(false);
  };

  const handleMarkAllRead = () => {
    if (filteredAlerts.length === 0) return;

    setAllAlerts(prev => prev.map(alert => {
        // Apenas marca como lido se estiver na lista filtrada atual
        if (filteredAlerts.some(f => f.id === alert.id)) {
            return { ...alert, resolved: true };
        }
        return alert;
    }));
    setToast({ msg: 'Todos os eventos visíveis foram marcados como resolvidos.', type: 'success' });
    setIsFabOpen(false);
  };

  const handleResolveSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAllAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    setToast({ msg: 'Evento marcado como resolvido.', type: 'success' });
    if (selectedAlert && selectedAlert.id === id) {
        setSelectedAlert(prev => prev ? {...prev, resolved: true} : null);
    }
  };

  const handleFilterCritical = () => {
      setFilterSeverity('high');
      setFilterType('all');
      setToast({ msg: 'Filtrando apenas eventos críticos.', type: 'info' });
      setIsFabOpen(false);
  };

  // --- UI HELPERS ---

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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
      
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
              <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
                  toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-blue-900/90 border-blue-500 text-blue-100'
              } backdrop-blur-md`}>
                  {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  <span className="font-medium text-sm">{toast.msg}</span>
              </div>
          </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <AlertTriangle className="w-8 h-8 text-blue-500" />
             Central de Eventos
           </h1>
           <p className="text-slate-400">Histórico completo de alertas e notificações da frota.</p>
        </div>
      </div>

      {/* --- NEW: PENDING ALERTS BANNER --- */}
      {pendingCount > 0 && (
          <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-orange-500/50 via-red-500/50 to-orange-500/50 animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="bg-slate-950 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                      <div className="p-3 bg-orange-500/20 rounded-full animate-pulse">
                          <Siren className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              Atenção Necessária
                              {criticalPendingCount > 0 && (
                                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                                      {criticalPendingCount} CRÍTICOS
                                  </span>
                              )}
                          </h3>
                          <p className="text-slate-400 text-sm">
                              Você possui <strong className="text-orange-400">{pendingCount} alertas pendentes</strong> que requerem análise da equipe.
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto relative z-10">
                      <button 
                        onClick={() => setFilterSeverity('high')}
                        className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                      >
                          Ver Críticos
                      </button>
                      <button 
                        onClick={handleMarkAllRead}
                        className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-lg shadow-orange-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          <CheckCheck className="w-4 h-4" />
                          Resolver Todos
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Stats Cards (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Total de Eventos</p>
             <p className="text-2xl font-bold text-white">{allAlerts.length}</p>
         </div>
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Críticos (High)</p>
             <p className="text-2xl font-bold text-red-400">{allAlerts.filter(a => a.severity === 'high').length}</p>
         </div>
         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Pendentes</p>
             <p className="text-2xl font-bold text-yellow-400">{allAlerts.filter(a => !a.resolved).length}</p>
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
            <input 
                type="text" 
                placeholder="Buscar por veículo ou tipo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
         </div>
         
         <div className="flex flex-col md:flex-row gap-4">
             <div className="relative min-w-[160px]">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-8 py-2 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                 >
                    <option value="all">Todos os Tipos</option>
                    <option value={AlertType.SPEED}>Velocidade</option>
                    <option value={AlertType.GEOFENCE}>Cerca Virtual</option>
                    <option value={AlertType.MAINTENANCE}>Manutenção</option>
                    <option value={AlertType.SOS}>SOS / Pânico</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
             </div>

             <div className="relative min-w-[160px]">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-500" />
                 <select 
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-2 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                 >
                    <option value="all">Todas Prioridades</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
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
                        <div 
                            key={alert.id} 
                            onClick={() => setSelectedAlert(alert)}
                            className={`p-5 hover:bg-slate-800/40 transition-all duration-300 flex flex-col md:flex-row gap-4 items-start md:items-center cursor-pointer group ${!alert.resolved ? 'bg-slate-900/50' : ''}`}
                        >
                            {/* Icon Column */}
                            <div className={`p-3 rounded-xl shrink-0 transition-all ${
                                alert.type === AlertType.SOS ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
                                !alert.resolved ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' :
                                'bg-slate-800 text-slate-400 border border-slate-700 group-hover:bg-slate-700 group-hover:text-white'
                            }`}>
                                <Icon className="w-6 h-6" />
                            </div>

                            {/* Info Column */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <h3 className={`font-bold text-lg group-hover:text-blue-400 transition-colors ${!alert.resolved ? 'text-white' : 'text-slate-300'}`}>
                                        {alert.type}
                                    </h3>
                                    <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getSeverityColor(alert.severity)}`}>
                                        {alert.severity} Priority
                                    </span>
                                    {!alert.resolved && <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full animate-pulse">NOVO</span>}
                                </div>
                                <p className="text-slate-400 text-sm">
                                    O veículo <span className="text-blue-400 font-mono font-medium">{alert.vehicleId === 'v1' ? 'ABC-1234' : alert.vehicleId === 'v4' ? 'GHI-7788' : 'XYZ-9988'}</span> gerou um alerta no sistema.
                                </p>
                            </div>

                            {/* Meta Column */}
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 text-right min-w-[140px] border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-center">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Clock className="w-4 h-4" />
                                    {alert.timestamp}
                                </div>
                                {alert.resolved ? (
                                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full border border-green-500/10">
                                        <CheckCircle className="w-3 h-3" />
                                        Resolvido
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/10">
                                        <XCircle className="w-3 h-3" />
                                        Pendente
                                    </div>
                                )}
                            </div>

                            {/* Actions Column */}
                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                {!alert.resolved && (
                                    <button 
                                        onClick={(e) => handleResolveSingle(alert.id, e)}
                                        className="p-2 hover:bg-green-500/20 text-slate-400 hover:text-green-400 rounded-lg transition-colors border border-transparent hover:border-green-500/30"
                                        title="Resolver"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                )}
                                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
          ) : (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Nenhum evento encontrado</h3>
                <p className="text-slate-500">Tente ajustar os filtros de busca ou tipo de alerta.</p>
            </div>
          )}
      </div>

      {/* --- NEW: FLOATING QUICK ACTION BUTTON (FAB) & SPEED DIAL --- */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
          {/* Speed Dial Menu */}
          <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${isFabOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              
              <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg border border-slate-800 shadow-lg">Resolver Todos</span>
                  <button 
                    onClick={handleMarkAllRead}
                    className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30 flex items-center justify-center transition-transform hover:scale-105"
                  >
                      <CheckCheck className="w-5 h-5" />
                  </button>
              </div>

              <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg border border-slate-800 shadow-lg">Exportar CSV</span>
                  <button 
                    onClick={handleExportCSV}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 flex items-center justify-center transition-transform hover:scale-105"
                  >
                      <FileDown className="w-5 h-5" />
                  </button>
              </div>

              <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded-lg border border-slate-800 shadow-lg">Filtrar Críticos</span>
                  <button 
                    onClick={handleFilterCritical}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 flex items-center justify-center transition-transform hover:scale-105"
                  >
                      <AlertTriangle className="w-5 h-5" />
                  </button>
              </div>

          </div>

          {/* FAB Trigger */}
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-900/50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto ${isFabOpen ? 'rotate-90' : 'rotate-0'}`}
          >
              {isFabOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
      </div>

      {/* DETAILS MODAL */}
      {selectedAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={() => setSelectedAlert(null)}>
              <div 
                  className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                      <div className="flex items-start gap-4">
                           <div className={`p-3 rounded-xl ${
                                selectedAlert.type === AlertType.SOS ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                           }`}>
                               {React.createElement(getIcon(selectedAlert.type), { className: "w-6 h-6" })}
                           </div>
                           <div>
                               <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Detalhes do Evento</p>
                               <h2 className="text-xl font-bold text-white">{selectedAlert.type}</h2>
                               <p className="text-slate-400 text-sm mt-1">ID: #{selectedAlert.id}</p>
                           </div>
                      </div>
                      <button onClick={() => setSelectedAlert(null)} className="text-slate-500 hover:text-white">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                              <p className="text-slate-500 text-xs mb-1">Veículo Envolvido</p>
                              <p className="text-white font-mono font-bold text-lg">{selectedAlert.vehicleId === 'v1' ? 'ABC-1234' : 'XYZ-9988'}</p>
                          </div>
                          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                              <p className="text-slate-500 text-xs mb-1">Horário do Ocorrido</p>
                              <p className="text-white font-medium">{selectedAlert.timestamp}</p>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              Descrição do Sistema
                          </h4>
                          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
                              O sistema detectou uma ocorrência de <strong>{selectedAlert.type}</strong> com severidade <strong>{selectedAlert.severity}</strong>. 
                              {selectedAlert.type === AlertType.SPEED && " O veículo ultrapassou o limite de 80km/h na Rodovia SP-101."}
                              {selectedAlert.type === AlertType.GEOFENCE && " O veículo saiu da zona delimitada 'Centro Logístico' fora do horário permitido."}
                              {selectedAlert.type === AlertType.SOS && " O motorista acionou o botão de pânico físico no painel."}
                          </div>
                      </div>
                      
                      {!selectedAlert.resolved ? (
                         <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start">
                             <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                             <div>
                                 <h4 className="text-sm font-bold text-yellow-500">Ação Necessária</h4>
                                 <p className="text-xs text-yellow-200/70 mt-1">Este alerta ainda não foi tratado pela equipe de monitoramento.</p>
                             </div>
                         </div>
                      ) : (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex gap-3 items-center">
                             <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                             <div>
                                 <h4 className="text-sm font-bold text-green-500">Resolvido</h4>
                                 <p className="text-xs text-green-200/70">Tratado por: Sistema Automático</p>
                             </div>
                         </div>
                      )}
                  </div>

                  <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                      <button 
                        onClick={() => setSelectedAlert(null)}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                          Fechar
                      </button>
                      {!selectedAlert.resolved && (
                          <button 
                            onClick={(e) => handleResolveSingle(selectedAlert.id, e)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-2"
                          >
                              <Check className="w-4 h-4" />
                              Marcar como Resolvido
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};