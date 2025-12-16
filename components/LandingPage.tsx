
import React from 'react';
import { 
  Shield, Smartphone, Cpu, Map, CheckCircle, ArrowRight, 
  Globe, Zap, Users, ChevronRight, Menu, X, Play
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (registerMode?: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
                onClick={() => onEnterApp(false)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/50 hover:bg-slate-800 text-white font-bold text-lg border border-slate-700 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              Ver Demonstração
            </button>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-in slide-in-from-bottom-10 duration-1000">
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-2 shadow-2xl backdrop-blur-sm">
               <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center border border-slate-800 group">
                  {/* Mockup visual */}
                  <div className="absolute inset-0 bg-slate-900 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                     <div className="h-full w-full grid grid-cols-12 grid-rows-6 gap-2 p-4">
                        <div className="col-span-3 row-span-6 bg-slate-800/30 rounded-lg border border-slate-800"></div>
                        <div className="col-span-9 row-span-4 bg-slate-800/30 rounded-lg border border-slate-800 relative overflow-hidden">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                        </div>
                        <div className="col-span-3 row-span-2 bg-slate-800/30 rounded-lg border border-slate-800"></div>
                        <div className="col-span-3 row-span-2 bg-slate-800/30 rounded-lg border border-slate-800"></div>
                        <div className="col-span-3 row-span-2 bg-slate-800/30 rounded-lg border border-slate-800"></div>
                     </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none">
                     <div className="text-center mt-32">
                         <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30 mb-2 backdrop-blur-md">
                            <Zap className="w-4 h-4 fill-current" />
                            <span className="text-xs font-bold">LIVE PREVIEW</span>
                         </div>
                         <p className="text-slate-400 text-sm">Painel de Controle NexusTrack Premium</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

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
                <li><a href="#" className="hover:text-blue-400">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-blue-400">Hardware</a></li>
                <li><a href="#" className="hover:text-blue-400">Integrações</a></li>
                <li><a href="#" className="hover:text-blue-400">Preços</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-blue-400">Carreiras</a></li>
                <li><a href="#" className="hover:text-blue-400">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400">Privacidade</a></li>
                <li><a href="#" className="hover:text-blue-400">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-blue-400">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© 2024 NexusTrack. Todos os direitos reservados.</p>
            <div className="flex gap-4">
               {/* Social Icons Placeholders */}
               <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"><Users className="w-4 h-4"/></div>
               <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer"><Globe className="w-4 h-4"/></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
