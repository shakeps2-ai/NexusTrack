import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Map, Truck, Users, Activity } from 'lucide-react';

interface MobileNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'map', icon: Map, label: 'Mapa' },
    { id: 'fleet', icon: Truck, label: 'Frota' },
    { id: 'employees', icon: Users, label: 'Equipe' },
    { id: 'analytics', icon: Activity, label: 'IA' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center px-2 py-3">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};