
import React, { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, Cpu, Map, CheckCircle, ArrowRight, 
  Globe, Zap, Users, ChevronRight, Menu, X, Play, FileText, Mail, Phone, Server, Maximize2, Headphones
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (registerMode?: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeInfo, setActiveInfo] = useState<{ title: string; content: React.ReactNode } | null>(null);
  
  // Controle do Modal de Vídeo
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // ID do Vídeo: Cyberpunk City Night (Alta compatibilidade de Embed)
  // Este vídeo é conhecido por permitir reprodução em sites externos sem erros
  const VIDEO_ID = "7PIji8OubXU"; 

  // Bloqueia o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isVideoModalOpen]);

  // Função auxiliar para rolar suavemente
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const features = [
    {
      icon: Map,
      title: "Rastreamento em Tempo Real",
      desc: "Monitore sua frota com precisão de metros, atualizações a cada 2 segundos e histórico completo de rotas."
    },
    {
      icon: Cpu,
      title: "Inteligência Artificial",
      desc: "Nossa IA analisa padrões de direção, prevê manutenções e otimiza o consumo de combustível automaticamente."
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      desc: "Bloqueio remoto imediato, alertas de ignição, cercas virtuais e botão de pânico integrado."
    },
    {
      icon: Smartphone,
      title: "Controle na Palma da Mão",
      desc: "App nativo para iOS e Android. Gerencie sua operação de qualquer lugar do mundo."
    }
  ];

  // Dados do Rodapé
  const footerLinks = {
    produto: [
      { 
        label: "Funcionalidades", 
        title: "Funcionalidades da Plataforma",
        content: (
          <div className="space-y-4">
            <p className="text-slate-300">Nossa plataforma oferece um conjunto completo de ferramentas para gestão:</p>
            <ul className="space-y-2">
              <li className="flex gap-2 items-center text-slate-400"><CheckCircle className="w-4 h-4 text-blue-500" /> Rastreamento GPS em tempo real (atualização 5s)</li>
              <li className="flex gap-2 items-center text-slate-400"><CheckCircle className="w-4 h-4 text-blue-500" /> Histórico de rotas de até 90 dias</li>
              <li className="flex gap-2 items-center text-slate-400"><CheckCircle className="w-4 h-4 text-blue-500" /> Bloqueio e desbloqueio remoto</li>
              <li className="flex gap-2 items-center text-slate-400"><CheckCircle className="w-4 h-4 text-blue-500" /> Cercas virtuais ilimitadas</li>
              <li className="flex gap-2 items-center text-slate-400"><CheckCircle className="w-4 h-4 text-blue-500" /> Relatórios de telemetria avançada</li>
            </ul>
          </div>
        )
      },
      { 
        label: "Hardware", 
        title: "Compatibilidade de Hardware",
        content: (
          <div className="space-y-4">
            <p className="text-slate-300">O NexusTrack é agnóstico a hardware, suportando mais de 2.000 modelos de rastreadores.</p>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-white mb-1">Rastreadores Fixos</h4>
                  <p className="text-xs text-slate-500">Teltonika, Suntech, Ruptela, CalAmp.</p>
               </div>
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-white mb-1">OBD-II</h4>
                  <p className="text-xs text-slate-500">Plug & Play para veículos leves.</p>
               </div>
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-white mb-1">Mobile</h4>
                  <p className="text-xs text-slate-500">App Rastreador (Android/iOS).</p>
               </div>
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-white mb-1">Satélite</h4>
                  <p className="text-xs text-slate-500">Spot, Globalstar (Áreas remotas).</p>
               </div>
            </div>
          </div>
        )
      },
      { 
        label: "Integrações", 
        title: "API & Integrações",
        content: (
          <div className="space-y-4">
             <p className="text-slate-300">Conecte sua operação ao seu ERP ou sistema de logística.</p>
             <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-white font-mono text-sm">REST API</span>
                    <span className="text-green-400 text-xs font-bold uppercase">Disponível</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-white font-mono text-sm">Webhooks</span>
                    <span className="text-green-400 text-xs font-bold uppercase">Disponível</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-white font-mono text-sm">Exportação CSV/JSON</span>
                    <span className="text-green-400 text-xs font-bold uppercase">Disponível</span>
                </div>
             </div>
          </div>
        )
      },
      { 
        label: "Preços", 
        title: "Planos e Preços",
        content: (
          <div className="space-y-4">
             <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
                <h4 className="text-lg font-bold text-white">Start</h4>
                <p className="text-2xl font-bold text-blue-400 my-2">R$ 29,90<span className="text-sm text-slate-500 font-normal">/mês</span></p>
                <p className="text-xs text-slate-400">Por veículo. Rastreamento básico e bloqueio.</p>
             </div>
             <div className="p-4 rounded-xl border border-blue-500 bg-blue-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">POPULAR</div>
                <h4 className="text-lg font-bold text-white">Pro AI</h4>
                <p className="text-2xl font-bold text-blue-400 my-2">R$ 59,90<span className="text-sm text-slate-500 font-normal">/mês</span></p>
                <p className="text-xs text-slate-400">Por veículo. Telemetria completa e Inteligência Artificial.</p>
             </div>
             <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
                <h4 className="text-lg font-bold text-white">Enterprise</h4>
                <p className="text-lg font-bold text-slate-300 my-2">Sob Consulta</p>
                <p className="text-xs text-slate-400">Frota acima de 50 veículos. API dedicada.</p>
             </div>
          </div>
        )
      }
    ],
    empresa: [
      { 
        label: "Sobre Nós", 
        title: "Sobre a NexusTrack",
        content: (
          <div className="space-y-4">
             <p className="text-slate-300 leading-relaxed">
               Fundada em 2021, a NexusTrack nasceu com a missão de democratizar a tecnologia de telemetria avançada. O que antes era acessível apenas para grandes transportadoras, hoje entregamos para frotas de qualquer tamanho.
             </p>
             <p className="text-slate-300 leading-relaxed">
               Nossa equipe é composta por engenheiros de software, especialistas em hardware e analistas de logística apaixonados por eficiência.
             </p>
             <div className="flex gap-4 pt-2">
                 <div className="text-center">
                    <p className="text-2xl font-bold text-white">3+</p>
                    <p className="text-xs text-slate-500">Anos de Mercado</p>
                 </div>
                 <div className="text-center">
                    <p className="text-2xl font-bold text-white">12</p>
                    <p className="text-xs text-slate-500">Países Atendidos</p>
                 </div>
             </div>
          </div>
        )
      },
      { 
        label: "Carreiras", 
        title: "Trabalhe Conosco",
        content: (
          <div className="space-y-4">
             <p className="text-slate-300">Estamos sempre em busca de talentos para construir o futuro da logística.</p>
             <h4 className="font-bold text-white mt-4 mb-2">Vagas Abertas:</h4>
             <ul className="space-y-2">
                <li className="p-3 bg-slate-900 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors">
                   <div>
                      <p className="text-sm font-bold text-white">Senior Frontend Dev (React)</p>
                      <p className="text-xs text-slate-500">Remoto • Tech</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-500" />
                </li>
                <li className="p-3 bg-slate-900 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors">
                   <div>
                      <p className="text-sm font-bold text-white">Analista de Suporte N2</p>
                      <p className="text-xs text-slate-500">Híbrido • SP</p>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-500" />
                </li>
             </ul>
             <p className="text-xs text-slate-500 mt-2">Envie seu CV para talentos@nexustrack.com</p>
          </div>
        )
      },
      { 
        label: "Contato", 
        title: "Canais de Atendimento",
        content: (
          <div className="space-y-5">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-lg text-blue-500"><Mail className="w-5 h-5" /></div>
                <div>
                   <p className="text-sm font-bold text-white">Email Comercial</p>
                   <p className="text-slate-400 text-sm">vendas@nexustrack.com</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600/10 rounded-lg text-green-500"><Phone className="w-5 h-5" /></div>
                <div>
                   <p className="text-sm font-bold text-white">Suporte Técnico</p>
                   <p className="text-slate-400 text-sm">0800 123 4567</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600/10 rounded-lg text-purple-500"><Map className="w-5 h-5" /></div>
                <div>
                   <p className="text-sm font-bold text-white">Escritório Central</p>
                   <p className="text-slate-400 text-sm">Av. Paulista, 1000 - Bela Vista<br/>São Paulo - SP</p>
                </div>
             </div>
          </div>
        )
      }
    ],
    legal: [
      { 
        label: "Privacidade", 
        title: "Política de Privacidade",
        content: (
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             <p>A sua privacidade é nossa prioridade. Esta política descreve como coletamos, usamos e protegemos seus dados.</p>
             <h5 className="text-white font-bold">1. Coleta de Dados</h5>
             <p>Coletamos dados de geolocalização, telemetria do veículo e informações de cadastro para fornecer o serviço de rastreamento.</p>
             <h5 className="text-white font-bold">2. Uso das Informações</h5>
             <p>Utilizamos os dados para gerar relatórios, alertas de segurança e otimização de rotas. Não vendemos seus dados para terceiros.</p>
             <h5 className="text-white font-bold">3. Segurança</h5>
             <p>Todos os dados são transmitidos via SSL/TLS e armazenados em servidores criptografados (AES-256).</p>
          </div>
        )
      },
      { 
        label: "Termos de Uso", 
        title: "Termos de Serviço",
        content: (
          <div className="space-y-4 text-sm text-slate-300">
             <p>Ao utilizar a plataforma NexusTrack, você concorda com os seguintes termos:</p>
             <ul className="list-disc pl-4 space-y-2">
                <li>O serviço é fornecido "como está", com garantia de uptime de 99.9% para clientes Enterprise.</li>
                <li>O usuário é responsável pela legalidade do rastreamento dos veículos cadastrados.</li>
                <li>O não pagamento da mensalidade pode acarretar na suspensão do serviço após 5 dias úteis.</li>
             </ul>
          </div>
        )
      },
      { 
        label: "LGPD", 
        title: "Conformidade LGPD",
        content: (
          <div className="space-y-4">
             <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-xl flex gap-3 items-start">
                 <Shield className="w-6 h-6 text-green-500 shrink-0" />
                 <div>
                    <h4 className="font-bold text-white text-sm">Compliance Total</h4>
                    <p className="text-xs text-slate-400 mt-1">Nossa plataforma está 100% adequada à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
                 </div>
             </div>
             <p className="text-sm text-slate-300">
                Você tem o direito de solicitar a exclusão, portabilidade ou anonimização dos seus dados a qualquer momento através do nosso portal de privacidade (DPO).
             </p>
             <button className="w-full py-2 bg-slate-800 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors">
                Falar com o DPO
             </button>
          </div>
        )
      }
    ]
  };

  return (
    // FIX: h-screen e overflow-y-auto adicionados para permitir rolagem independente do body:hidden
    <div className="h-screen overflow-y-auto bg-slate-950 text-white font-sans selection:bg-blue-500/30 scroll-smooth">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                NexusTrack
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('recursos')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Recursos</button>
              <button onClick={() => scrollToSection('beneficios')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Benefícios</button>
              <button 
                onClick={() => onEnterApp(false)} // false = Login mode
                className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold border border-slate-700 transition-all hover:border-blue-500/50"
              >
                Área do Cliente
              </button>
              <button 
                onClick={() => onEnterApp(true)} // true = Register mode
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
              >
                Começar Agora
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4 animate-in slide-in-from-top-5">
            <button className="block w-full text-left text-slate-400 hover:text-white" onClick={() => scrollToSection('recursos')}>Recursos</button>
            <button className="block w-full text-left text-slate-400 hover:text-white" onClick={() => scrollToSection('beneficios')}>Benefícios</button>
            <button onClick={() => onEnterApp(false)} className="w-full py-3 bg-slate-800 rounded-xl font-bold text-white mb-2 border border-slate-700">Área do Cliente</button>
            <button onClick={() => onEnterApp(true)} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white">Criar Conta Grátis</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Tecnologia de Rastreamento 4.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
            Controle Total da Sua Frota <br className="hidden md:block" />
            Com Inteligência Artificial
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Aumente a produtividade, reduza custos e garanta a segurança dos seus veículos com a plataforma de telemetria mais avançada do mercado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onEnterApp(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Fazer Teste Grátis
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/50 hover:bg-slate-800 text-white font-bold text-lg border border-slate-700 transition-all flex items-center justify-center gap-2 backdrop-blur-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              Ver Demonstração
            </button>
          </div>

          {/* Featured Visual Container */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-in slide-in-from-bottom-10 duration-1000 z-10 group">
            
            {/* Glow Effect Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            {/* Static Facade (Click triggers Modal) */}
            <div className="relative rounded-[1.5rem] bg-slate-950 border border-slate-700/50 shadow-2xl overflow-hidden aspect-video">
                <div 
                    className="absolute inset-0 w-full h-full cursor-pointer relative group" 
                    onClick={() => setIsVideoModalOpen(true)}
                >
                     {/* High Res Thumbnail */}
                     <img 
                        src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`} 
                        alt="NexusTrack Demo" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     />
                     
                     {/* Cinematic Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 transition-opacity group-hover:opacity-80"></div>
                     
                     {/* Badges de Qualidade */}
                     <div className="absolute top-6 right-6 flex gap-2">
                         <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase text-white tracking-wider shadow-lg">4K HDR</span>
                         <span className="px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md border border-blue-400/20 text-[10px] font-bold uppercase text-white tracking-wider shadow-lg flex items-center gap-1"><Headphones className="w-3 h-3" /> Relaxing Mode</span>
                     </div>
                     
                     {/* Título do Vídeo e Descrição */}
                     <div className="absolute bottom-8 left-8 text-left max-w-lg">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <p className="text-blue-400 font-bold text-xs tracking-widest uppercase">NexusTrack Experience</p>
                         </div>
                         <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-xl mb-2">Monitoramento Noturno</h3>
                         <p className="text-slate-300 text-sm md:text-base opacity-80 line-clamp-2">Experimente a tranquilidade de saber que sua frota está segura 24h. (Áudio Relaxante Incluso)</p>
                     </div>

                     {/* Botão Play Central */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all pl-1">
                             <Play className="w-8 h-8 text-white fill-current" />
                         </div>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VIDEO MODAL (POPUP) --- */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 p-4 md:p-8" onClick={() => setIsVideoModalOpen(false)}>
           <div 
             className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-in zoom-in-95 duration-300"
             onClick={(e) => e.stopPropagation()}
           >
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1&rel=0&showinfo=0&controls=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title="NexusTrack Premium Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
              
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-blue-600 rounded-full text-white backdrop-blur-sm border border-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
        </div>
      )}

      {/* --- FEATURES SECTION --- */}
      <section id="recursos" className="py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Poder além do rastreamento</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Combinamos hardware de ponta com software intuitivo para entregar uma experiência completa de gestão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-slate-900 group-hover:bg-blue-600 transition-colors flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS / TRUST --- */}
      <section className="py-20 border-b border-slate-800/50">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <p className="text-4xl font-bold text-white mb-2">+50k</p>
               <p className="text-slate-500 text-sm uppercase tracking-wider">Veículos Rastreados</p>
            </div>
            <div>
               <p className="text-4xl font-bold text-white mb-2">99.9%</p>
               <p className="text-slate-500 text-sm uppercase tracking-wider">Uptime Garantido</p>
            </div>
            <div>
               <p className="text-4xl font-bold text-white mb-2">-30%</p>
               <p className="text-slate-500 text-sm uppercase tracking-wider">Custos Operacionais</p>
            </div>
            <div>
               <p className="text-4xl font-bold text-white mb-2">24/7</p>
               <p className="text-slate-500 text-sm uppercase tracking-wider">Suporte Técnico</p>
            </div>
         </div>
      </section>

      {/* --- BENEFIT HIGHLIGHT --- */}
      <section id="beneficios" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
               <div className="inline-block px-4 py-1 rounded-full bg-blue-600/10 text-blue-400 font-bold text-xs uppercase mb-6 border border-blue-600/20">
                 Economia Real
               </div>
               <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                 Reduza custos de combustível e manutenção
               </h2>
               <p className="text-slate-400 text-lg mb-8">
                 Nossa plataforma identifica comportamentos de risco, rotas ineficientes e uso não autorizado do veículo fora do horário de expediente.
               </p>
               
               <div className="space-y-4">
                 {[
                   "Alertas de excesso de velocidade e frenagem brusca",
                   "Relatórios detalhados de consumo de combustível",
                   "Controle de manutenção preventiva automatizado",
                   "Bloqueio de veículo via aplicativo"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                       <CheckCircle className="w-4 h-4 text-green-500" />
                     </div>
                     <span className="text-slate-300 font-medium">{item}</span>
                   </div>
                 ))}
               </div>

               <button 
                  onClick={() => onEnterApp(true)}
                  className="mt-10 flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors group"
               >
                 Conheça todas as funcionalidades 
                 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>

            <div className="relative">
               <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-2xl"></div>
               <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="font-bold text-white">Relatório de Eficiência</h3>
                     <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded">Últimos 30 dias</span>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-sm mb-2">
                           <span className="text-slate-400">Economia de Combustível</span>
                           <span className="text-green-400 font-bold">+15%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-[75%] bg-green-500 rounded-full"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-sm mb-2">
                           <span className="text-slate-400">Produtividade da Frota</span>
                           <span className="text-blue-400 font-bold">+22%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-[85%] bg-blue-500 rounded-full"></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-sm mb-2">
                           <span className="text-slate-400">Incidentes de Segurança</span>
                           <span className="text-purple-400 font-bold">-90%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-[10%] bg-purple-500 rounded-full"></div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500">
                        <Zap className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white">Economia Projetada</p>
                        <p className="text-xs text-slate-500">R$ 12.450,00 / ano por veículo</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar sua gestão?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            Junte-se a mais de 5.000 empresas que confiam no NexusTrack para monitorar seus ativos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onEnterApp(true)}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-slate-100 transition-colors shadow-2xl"
            >
              Criar Conta Grátis
            </button>
            <button 
              onClick={() => onEnterApp(false)}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border border-slate-600 text-white font-bold text-lg hover:bg-slate-800 hover:border-slate-500 transition-colors"
            >
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 pb-32 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">NexusTrack</span>
              </div>
              <p className="text-slate-500 text-sm">
                Soluções avançadas em telemetria e rastreamento veicular para empresas de todos os tamanhos.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                 {footerLinks.produto.map((item, i) => (
                    <li key={i}>
                       <button 
                         onClick={() => setActiveInfo(item)}
                         className="hover:text-blue-400 transition-colors text-left"
                       >
                         {item.label}
                       </button>
                    </li>
                 ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                 {footerLinks.empresa.map((item, i) => (
                    <li key={i}>
                       <button 
                         onClick={() => setActiveInfo(item)}
                         className="hover:text-blue-400 transition-colors text-left"
                       >
                         {item.label}
                       </button>
                    </li>
                 ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                 {footerLinks.legal.map((item, i) => (
                    <li key={i}>
                       <button 
                         onClick={() => setActiveInfo(item)}
                         className="hover:text-blue-400 transition-colors text-left"
                       >
                         {item.label}
                       </button>
                    </li>
                 ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© 2024 NexusTrack. Todos os direitos reservados.</p>
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"><Users className="w-4 h-4"/></div>
               <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"><Globe className="w-4 h-4"/></div>
            </div>
          </div>
        </div>
      </footer>

      {/* --- INFO MODAL --- */}
      {activeInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setActiveInfo(null)}>
           <div 
             className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/50">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    {activeInfo.title}
                 </h3>
                 <button 
                   onClick={() => setActiveInfo(null)}
                   className="text-slate-500 hover:text-white transition-colors"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-6">
                 {activeInfo.content}
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex justify-end">
                 <button 
                   onClick={() => setActiveInfo(null)}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                 >
                   Fechar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
