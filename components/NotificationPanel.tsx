import React from 'react';
import { Alert, AlertType } from '../types';
import { AlertTriangle, Info, CheckCircle, Clock, X, Trash2, ArrowRight } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onViewHistory: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, alerts, onViewHistory }) => {
  if (!isOpen) return null;

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  const handleViewAll = () => {
      onViewHistory();
      onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose}></div>
      <div className="absolute top-16 right-4 md:right-20 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 ring-1 ring-white/10">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">Notificações</h3>
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg shadow-blue-600/20">{unresolvedAlerts.length}</span>
            </div>
            <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Marcar todas como lidas">
                    <CheckCircle className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Limpar tudo">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-slate-900/80">
            {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação recente.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800">
                    {unresolvedAlerts.map(alert => (
                        <div key={alert.id} className="p-4 hover:bg-slate-800/50 transition-colors relative group cursor-pointer border-l-2 border-l-blue-500 bg-blue-500/5">
                            <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                                    alert.type === AlertType.SPEED ? 'bg-red-500/10 text-red-500' :
                                    alert.type === AlertType.MAINTENANCE ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{alert.type}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">Veículo ID: {alert.vehicleId} reportou um evento de {alert.severity} prioridade.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {resolvedAlerts.map(alert => (
                         <div key={alert.id} className="p-4 hover:bg-slate-800/30 transition-colors opacity-60 bg-slate-900">
                            <div className="flex gap-3">
                                <div className="mt-1 p-2 rounded-lg shrink-0 bg-slate-800 text-slate-500">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-300 line-through">{alert.type}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Resolvido - Veículo {alert.vehicleId}</p>
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center backdrop-blur">
            <button 
                onClick={handleViewAll}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs text-blue-400 hover:text-white hover:bg-blue-600/10 rounded-lg transition-all font-medium group"
            >
                Ver Histórico Completo
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </button>
        </div>
      </div>
    </>
  );
};