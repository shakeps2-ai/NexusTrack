import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, Driver, Alert } from '../types';
import { analyzeFleet } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface AIAnalystProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ vehicles, drivers, alerts }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o NexusAI. Posso ajudar você a analisar o desempenho da frota, otimizar rotas ou verificar o status dos motoristas. O que você gostaria de saber hoje?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const response = await analyzeFleet(userMsg, vehicles, drivers, alerts);

    setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
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
       <div className="mb-4 md:mb-6 flex items-center gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-purple-900/20">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Nexus AI Analyst</h1>
            <p className="text-slate-400 text-xs md:text-sm">Inteligência Artificial para otimização.</p>
          </div>
       </div>

       <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm flex flex-col overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6" ref={scrollRef}>
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-700'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <User className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />}
                  </div>
                  <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 ${
                    msg.role === 'assistant' 
                      ? 'bg-slate-800 text-slate-200 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    <div className="markdown-body text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                    </div>
                    <div className="text-[10px] opacity-50 mt-1 md:mt-2 text-right">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
               </div>
             ))}
             {loading && (
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6 text-white animate-pulse" />
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
                  className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
             </div>
             <p className="text-center text-[10px] md:text-xs text-slate-600 mt-2">
                O NexusAI pode cometer erros. Verifique informações críticas no painel.
             </p>
          </div>
       </div>
    </div>
  );
};