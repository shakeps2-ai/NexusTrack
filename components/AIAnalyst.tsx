
import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, Driver, Alert } from '../types';
import { analyzeFleet, AIResponse } from '../services/geminiService';
import { Send, Bot, User, Sparkles, CloudLightning, Cpu } from 'lucide-react';

interface AIAnalystProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'cloud' | 'local'; // Rastreia qual inteligência respondeu
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ vehicles, drivers, alerts }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o NexusAI. Posso ajudar você a analisar o desempenho da frota, otimizar rotas ou verificar o status dos motoristas.',
      timestamp: new Date(),
      source: 'local'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastSource, setLastSource] = useState<'cloud' | 'local'>('local');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setLoading(true);

    // Chama o serviço híbrido
    const response: AIResponse = await analyzeFleet(userMsg, vehicles, drivers, alerts);

    setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.text, 
        timestamp: new Date(),
        source: response.source
    }]);
    
    setLastSource(response.source);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 md:p-8 animate-fade-in pb-20 md:pb-8">
       {/* Header com Indicador de Status */}
       <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 md:p-3 rounded-xl shadow-lg transition-colors ${
                loading ? 'bg-slate-700 animate-pulse' :
                lastSource === 'cloud' ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-purple-900/20' : 
                'bg-slate-800 border border-slate-700'
            }`}>
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Nexus AI Analyst</h1>
                <p className="text-slate-400 text-xs md:text-sm">Inteligência Artificial para otimização.</p>
            </div>
          </div>
          
          {/* Badge de Status do Motor */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
              lastSource === 'cloud' 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}>
              {lastSource === 'cloud' ? <CloudLightning className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
              {lastSource === 'cloud' ? 'Modo Nuvem' : 'Modo Local'}
          </div>
       </div>

       <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm flex flex-col overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6" ref={scrollRef}>
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' 
                        ? (msg.source === 'cloud' ? 'bg-blue-600' : 'bg-slate-700 border border-slate-600') 
                        : 'bg-slate-800'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <User className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />}
                  </div>
                  <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 shadow-sm ${
                    msg.role === 'assistant' 
                      ? (msg.source === 'cloud' ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50' : 'bg-slate-800/80 text-slate-300 rounded-tl-none border border-slate-700')
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    <div className="markdown-body text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 md:mt-2 opacity-50">
                        {msg.role === 'assistant' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold">
                                {msg.source === 'cloud' ? '⚡ Gemini' : '🧠 Local'}
                            </span>
                        )}
                        <span className="text-[10px]">
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                  </div>
               </div>
             ))}
             {loading && (
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Bot className="w-6 h-6 text-blue-400 animate-pulse" />
                 </div>
                 <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/80">
             <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre a frota..."
                  className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm md:text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !query.trim()}
                  className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
             </div>
             <p className="text-center text-[10px] md:text-xs text-slate-600 mt-2">
                {lastSource === 'cloud' ? 'Conectado à Nuvem Segura.' : 'Operando em Modo Offline Seguro.'}
             </p>
          </div>
       </div>
    </div>
  );
};
