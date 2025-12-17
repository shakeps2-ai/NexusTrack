
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { 
    Layers, Globe, Loader2, Plus, Minus, Maximize, Crosshair, MapPin, 
    Truck, Search, ChevronLeft, ChevronRight, Lock, Unlock, Gauge, Fuel
} from 'lucide-react';
import * as L from 'leaflet';

interface MapTrackerProps {
  vehicles: Vehicle[];
  onToggleLock: (id: string) => void;
}

type MapStyle = 'dark' | 'satellite' | 'light' | 'osm';

// --- CONFIGURAÇÃO ESTÁTICA ---

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    name: 'Nexus Dark'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    name: 'Satélite Pro'
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    name: 'Street Light'
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OSM',
    name: 'OpenStreetMap'
  }
};

const BASE_LAT = -23.5505;
const BASE_LNG = -46.6333;
const COORD_SCALE = 0.15;

// Helper otimizado para cálculo de coordenadas
const getRealCoords = (latPercent: number, lngPercent: number): [number, number] => {
  const lat = BASE_LAT - ((latPercent - 50) / 100 * COORD_SCALE);
  const lng = BASE_LNG + ((lngPercent - 50) / 100 * COORD_SCALE);
  return [lat, lng];
};

const createCustomIcon = (status: VehicleStatus, isSelected: boolean, isLocked: boolean) => {
    let colorClass = 'bg-slate-500';
    let glowClass = 'shadow-none';

    if (isLocked) {
        colorClass = 'bg-red-600';
        glowClass = 'shadow-[0_0_20px_rgba(220,38,38,0.8)]';
    } else {
        switch (status) {
            case VehicleStatus.MOVING:
                colorClass = 'bg-blue-500';
                glowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.6)]';
                break;
            case VehicleStatus.STOPPED:
                colorClass = 'bg-yellow-500';
                glowClass = 'shadow-[0_0_15px_rgba(234,179,8,0.6)]';
                break;
        }
    }

    // Simplificado para reduzir carga no DOM durante animações
    const html = `
      <div class="relative flex items-center justify-center w-full h-full">
        <div class="absolute w-full h-full rounded-full ${colorClass} opacity-20 ${!isLocked && status === VehicleStatus.MOVING ? 'animate-ping' : ''}"></div>
        <div class="relative w-8 h-8 rounded-full ${colorClass} border-2 border-white/20 ${glowClass} flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 border-white' : ''}">
          ${isLocked 
             ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
             : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`
          }
        </div>
        ${isSelected ? `<div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-${colorClass.replace('bg-', '')}"></div>` : ''}
      </div>
    `;

    return L.divIcon({
      className: 'custom-vehicle-marker',
      html: html,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -25]
    });
};

// Interface para rastrear estado visual anterior do marcador
interface MarkerState {
    status: VehicleStatus;
    isLocked: boolean;
    isSelected: boolean;
}

export const MapTracker: React.FC<MapTrackerProps> = ({ vehicles, onToggleLock }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const markerStatesRef = useRef<{ [key: string]: MarkerState }>({}); // Cache de estado visual
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle>('dark');
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loadingLock, setLoadingLock] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Side Panel State
  const [isListOpen, setIsListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLockClick = async (id: string) => {
      setLoadingLock(id);
      setTimeout(() => {
          onToggleLock(id);
          setLoadingLock(null);
      }, 1000);
  };

  // --- MAP CONTROLS FUNCTIONS ---

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || vehicles.length === 0) return;
    const latLngs = vehicles.map(v => getRealCoords(v.location.lat, v.location.lng));
    const bounds = L.latLngBounds(latLngs);
    if (userMarkerRef.current) bounds.extend(userMarkerRef.current.getLatLng());
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const map = mapInstanceRef.current;
            if (map) {
                if (userMarkerRef.current) userMarkerRef.current.remove();
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: `<div class="relative flex items-center justify-center w-6 h-6"><div class="absolute w-full h-full rounded-full bg-blue-500 opacity-30 animate-ping"></div><div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
                userMarkerRef.current = marker;
                map.flyTo([latitude, longitude], 16, { duration: 1.5 });
            }
            setIsLocating(false);
        },
        (error) => {
            console.error(error);
            setIsLocating(false);
        }
    );
  };

  // --- EFFECTS ---

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, { 
        zoomControl: false, 
        attributionControl: false,
        preferCanvas: true // OTIMIZAÇÃO: Usa Canvas para renderização de vetores se possível
    }).setView([BASE_LAT, BASE_LNG], 13);
    
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[currentMapStyle].url, { 
        attribution: TILE_LAYERS[currentMapStyle].attribution, 
        maxZoom: 19,
        // OTIMIZAÇÃO: Carregamento mais suave
        keepBuffer: 2
    }).addTo(map);
    
    mapInstanceRef.current = map;
    
    // CORREÇÃO CRÍTICA: Força o recalculo do tamanho do mapa após montagem
    // Isso evita o problema de "mapa cinza" comum em SPAs/Tabs
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_LAYERS[currentMapStyle].url);
  }, [currentMapStyle]);

  // Atualização dos Marcadores (OTIMIZADO)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    vehicles.forEach(vehicle => {
      const [lat, lng] = getRealCoords(vehicle.location.lat, vehicle.location.lng);
      const isSelected = selectedVehicleId === vehicle.id;
      
      // Estado atual para comparação
      const currentState: MarkerState = {
          status: vehicle.status,
          isLocked: vehicle.isLocked,
          isSelected: isSelected
      };

      if (markersRef.current[vehicle.id]) {
        const marker = markersRef.current[vehicle.id];
        const prevState = markerStatesRef.current[vehicle.id];

        // Só atualiza a posição (leve)
        marker.setLatLng([lat, lng]);

        // Só recria o ícone se houver mudança visual (pesado)
        if (!prevState || 
            prevState.status !== currentState.status || 
            prevState.isLocked !== currentState.isLocked ||
            prevState.isSelected !== currentState.isSelected) {
            
            marker.setIcon(createCustomIcon(vehicle.status, isSelected, vehicle.isLocked));
            markerStatesRef.current[vehicle.id] = currentState;
            
            // Z-Index: Selecionado sempre por cima
            marker.setZIndexOffset(isSelected ? 1000 : 0);
        }

        if (isSelected && (!prevState || !prevState.isSelected)) {
             map.flyTo([lat, lng], 15, { duration: 1.5 });
        }

      } else {
        // Novo marcador
        const marker = L.marker([lat, lng], { 
            icon: createCustomIcon(vehicle.status, isSelected, vehicle.isLocked),
            zIndexOffset: isSelected ? 1000 : 0
        }).addTo(map);
        
        marker.on('click', () => { 
            // Usa o estado funcional para garantir ID atualizado
            setSelectedVehicleId(vehicle.id); 
        });
        
        markersRef.current[vehicle.id] = marker;
        markerStatesRef.current[vehicle.id] = currentState;
      }
    });

    // Cleanup de marcadores antigos
    Object.keys(markersRef.current).forEach(id => {
      if (!vehicles.find(v => v.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
        delete markerStatesRef.current[id];
      }
    });
  }, [vehicles, selectedVehicleId, currentMapStyle]);

  // Atualiza tamanho do mapa ao redimensionar a janela
  useEffect(() => {
      const handleResize = () => {
          if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
          }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- FILTERED LIST ---
  const filteredList = useMemo(() => {
      return vehicles.filter(v => 
          v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
          v.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [vehicles, searchTerm]);

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 animate-fade-in flex">
      
      {/* --- SIDE VEHICLE LIST --- */}
      <div 
        className={`absolute top-4 left-4 bottom-24 md:bottom-4 z-[400] transition-all duration-300 flex flex-col ${
            isListOpen ? 'w-72' : 'w-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>

            {/* List Header */}
            <div className="p-4 border-b border-slate-800/50 shrink-0 bg-slate-900/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-500" />
                        Minha Frota
                    </h3>
                    <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-white font-mono shadow-inner">
                        {vehicles.length}
                    </span>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-slate-900 transition-all placeholder-slate-600"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {filteredList.map(vehicle => (
                    <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all group relative overflow-hidden ${
                            selectedVehicleId === vehicle.id 
                            ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/10' 
                            : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-800'
                        }`}
                    >
                         {selectedVehicleId === vehicle.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>}

                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 border-2 border-slate-950 shadow-sm ${
                            vehicle.isLocked ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                            vehicle.status === VehicleStatus.MOVING ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' :
                            vehicle.status === VehicleStatus.STOPPED ? 'bg-yellow-500' : 'bg-slate-600'
                        }`} />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={`text-xs md:text-sm font-bold truncate ${selectedVehicleId === vehicle.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {vehicle.model}
                                </span>
                                {vehicle.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-mono bg-slate-950 px-1 py-px rounded border border-slate-800/50">{vehicle.plate}</span>
                                <span>•</span>
                                <span className={
                                    vehicle.status === VehicleStatus.MOVING ? 'text-blue-400' : 
                                    vehicle.status === VehicleStatus.STOPPED ? 'text-yellow-500' : 'text-slate-500'
                                }>{vehicle.status}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- LIST TOGGLE BUTTON --- */}
      <button 
        onClick={() => setIsListOpen(!isListOpen)}
        className={`absolute z-[400] top-4 transition-all duration-300 bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 text-slate-400 hover:text-white p-2.5 rounded-xl shadow-xl hover:border-blue-500 group ${
            isListOpen ? 'left-[304px]' : 'left-4'
        }`}
        title={isListOpen ? "Recolher Lista" : "Expandir Lista"}
      >
          {isListOpen ? <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />}
      </button>

      {/* --- MAP CONTAINER --- */}
      <div className="flex-1 relative h-full">
         <div id="map" ref={mapContainerRef} className="w-full h-full z-0" />

         {/* --- RIGHT SIDE CONTROLS --- */}
         <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-2">
             <div className="relative">
                <button onClick={() => setShowLayerControl(!showLayerControl)} className="bg-slate-900/90 backdrop-blur-md text-slate-300 p-3 rounded-xl border border-slate-800 shadow-xl hover:bg-blue-600 hover:text-white transition-all" title="Camadas do Mapa"><Layers className="w-5 h-5" /></button>
                <div className={`absolute right-0 top-14 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl w-48 transform transition-all duration-200 origin-top-right ${showLayerControl ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Estilo</h3>
                    <div className="space-y-1">{(Object.keys(TILE_LAYERS) as MapStyle[]).map((style) => (<button key={style} onClick={() => { setCurrentMapStyle(style); setShowLayerControl(false); }} className={`w-full text-xs p-2 rounded-lg border text-left transition-all ${currentMapStyle === style ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200'}`}>{TILE_LAYERS[style].name}</button>))}</div>
                </div>
             </div>
         </div>

         <div className="absolute bottom-24 md:bottom-8 right-4 z-[400] flex flex-col gap-2">
             <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                 <button onClick={handleLocateMe} className={`p-3 transition-colors ${isLocating ? 'text-blue-500 animate-pulse bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title="Minha Localização">{isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}</button>
                 <div className="h-px bg-slate-800 w-full" />
                 <button onClick={handleFitBounds} className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors" title="Ver Frota Completa"><Maximize className="w-5 h-5" /></button>
             </div>
             <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                 <button onClick={handleZoomIn} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Zoom In"><Plus className="w-5 h-5" /></button>
                 <div className="h-px bg-slate-800 w-full" />
                 <button onClick={handleZoomOut} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Zoom Out"><Minus className="w-5 h-5" /></button>
             </div>
         </div>

         {/* --- BOTTOM CENTER VEHICLE DETAIL --- */}
         {selectedVehicleData && (
              <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[450px] z-[400] animate-in slide-in-from-bottom-10 fade-in duration-300">
                  <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedVehicleData.isLocked ? 'from-red-600 to-red-900' : 'from-blue-600 to-purple-600'}`}></div>
                      
                      <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <div className="flex items-center gap-2">
                                      {selectedVehicleData.isLocked && <Lock className="w-4 h-4 text-red-500 animate-pulse" />}
                                      <h2 className={`text-lg font-bold flex items-center gap-2 ${selectedVehicleData.isLocked ? 'text-red-400' : 'text-white'}`}>
                                          {selectedVehicleData.model}
                                      </h2>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{selectedVehicleData.plate}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${selectedVehicleData.isLocked ? 'bg-red-500/20 text-red-400' : selectedVehicleData.status === VehicleStatus.MOVING ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{selectedVehicleData.isLocked ? 'BLOQUEADO' : selectedVehicleData.status}</span>
                                  </div>
                              </div>
                              <button onClick={() => setSelectedVehicleId(null)} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"><span className="sr-only">Fechar</span><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </div>

                          <div className="grid grid-cols-3 gap-3 border-t border-slate-800 py-4">
                              <div className="flex flex-col items-center justify-center p-2 bg-slate-900/50 rounded-lg border border-slate-800"><Gauge className="w-5 h-5 text-blue-500 mb-1" /><span className="text-lg font-bold text-white">{Math.round(selectedVehicleData.speed)}</span><span className="text-[10px] text-slate-500 uppercase">km/h</span></div>
                              <div className="flex flex-col items-center justify-center p-2 bg-slate-900/50 rounded-lg border border-slate-800"><Fuel className="w-5 h-5 text-purple-500 mb-1" /><span className="text-lg font-bold text-white">{selectedVehicleData.fuelLevel}%</span><span className="text-[10px] text-slate-500 uppercase">Tanque</span></div>
                              <div className="flex flex-col items-center justify-center p-2 bg-slate-900/50 rounded-lg border border-slate-800"><MapPin className="w-5 h-5 text-green-500 mb-1" /><span className="text-lg font-bold text-white">GPS</span><span className="text-[10px] text-slate-500 uppercase">Online</span></div>
                          </div>

                          <button onClick={() => handleLockClick(selectedVehicleData.id)} disabled={!!loadingLock} className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${selectedVehicleData.isLocked ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'}`}>
                              {loadingLock === selectedVehicleData.id ? (<Loader2 className="w-4 h-4 animate-spin" />) : (selectedVehicleData.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
                              {selectedVehicleData.isLocked ? 'DESBLOQUEAR VEÍCULO' : 'BLOQUEAR VEÍCULO'}
                          </button>
                      </div>
                  </div>
              </div>
         )}
      </div>
    </div>
  );
};
