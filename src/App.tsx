import { useState } from 'react';
import { Shield, Droplet, Menu, X, ArrowRight, Globe, Eye } from 'lucide-react';
import TAPViewer from './components/TAPViewer';
import InteractiveSimulator from './components/InteractiveSimulator';
import ProductFeatures from './components/ProductFeatures';
import TeamSection from './components/TeamSection';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 grid-bg font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-dark-900/50 backdrop-blur-md transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-white tracking-tight leading-none text-base">W-GUARD</span>
              <span className="text-[9px] text-brand-400 font-mono tracking-widest font-bold">SMART WATER</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button onClick={() => scrollToSection('features')} className="text-dark-300 hover:text-white transition-colors">Entregas</button>
            <button onClick={() => scrollToSection('simulator')} className="text-dark-300 hover:text-white transition-colors">Simulador</button>
            <button onClick={() => scrollToSection('tap')} className="text-dark-300 hover:text-white transition-colors">Documento TAP</button>
            <button onClick={() => scrollToSection('team')} className="text-dark-300 hover:text-white transition-colors">Equipe</button>
          </nav>

          {/* CTA Header Button */}
          <div className="hidden md:block">
            <button 
              onClick={() => scrollToSection('simulator')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs border border-brand-400/20 shadow-lg shadow-brand-500/15 transition-all duration-350"
            >
              <Eye className="w-3.5 h-3.5" /> Testar Simulador
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            className="md:hidden p-2 text-dark-300 hover:text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-dark-850 animate-fadeIn py-4 px-6 space-y-4">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left font-semibold text-sm py-2 text-dark-300 hover:text-white">Entregas</button>
            <button onClick={() => scrollToSection('simulator')} className="block w-full text-left font-semibold text-sm py-2 text-dark-300 hover:text-white">Simulador</button>
            <button onClick={() => scrollToSection('tap')} className="block w-full text-left font-semibold text-sm py-2 text-dark-300 hover:text-white">Documento TAP</button>
            <button onClick={() => scrollToSection('team')} className="block w-full text-left font-semibold text-sm py-2 text-dark-300 hover:text-white">Equipe</button>
            <button 
              onClick={() => scrollToSection('simulator')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 text-white font-bold text-sm shadow-md"
            >
              Testar Simulador
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 md:px-8 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-xs font-semibold tracking-wider text-brand-400 uppercase bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20 mb-6">
              🌱 IoT & Cidades Inteligentes
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
              Saneamento Inteligente e <br />
              <span className="text-gradient-cyan-blue">Autossustentabilidade</span>
            </h1>
            <p className="text-dark-300 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              O W-Guard é um ecossistema IoT modular projetado para proteger consumidores contra cobranças indevidas de ar na tubulação, detectar vazamentos em tempo real e atuar preventivamente em bueiros urbanos para evitar enchentes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => scrollToSection('simulator')}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all duration-300 group"
              >
                Simulador Interativo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('tap')}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-dark-900 border border-dark-800 hover:border-dark-700 text-white font-semibold text-sm hover:bg-dark-850 transition-all duration-300"
              >
                Termo de Abertura (TAP)
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mt-16 pt-8 border-t border-dark-900/60">
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-brand-400 font-display">100%</span>
                <span className="text-xs text-dark-400">Proteção de Erro por Ar</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-blue-400 font-display">&gt;95%</span>
                <span className="text-xs text-dark-400">Precisão da Medição</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-teal-400 font-display">LoRa</span>
                <span className="text-xs text-dark-400">Até 500m de Alcance</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-emerald-400 font-display">Clean</span>
                <span className="text-xs text-dark-400">Autonomia Hidráulica</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup (L: 5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-tr from-brand-500/20 to-blue-500/10 rounded-full flex items-center justify-center animate-float border border-brand-500/20 shadow-2xl shadow-brand-500/5">
              
              {/* Spinning particle outer ring */}
              <div className="absolute inset-4 rounded-full border border-dashed border-brand-500/30 animate-[spin_40s_linear_infinite]" />
              
              {/* Inner Circle glasscard mock */}
              <div className="w-64 h-64 rounded-full bg-dark-950/80 border border-dark-800/80 flex flex-col items-center justify-center p-6 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-500/5">
                  <Droplet className="w-9 h-9 animate-pulse" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-white">W-GUARD v1.0</h3>
                <p className="text-[10px] text-brand-400 font-mono tracking-widest font-bold mt-1 uppercase">Smart IoT Node</p>
                <p className="text-xs text-dark-400 mt-3 max-w-[180px]">
                  Medição Hídrica Residencial e Urbana Autossustentável.
                </p>

                {/* Flow indicator badge */}
                <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SISTEMA ONLINE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <ProductFeatures />
      <InteractiveSimulator />
      <TAPViewer />
      <TeamSection />

      {/* Academic / Context Banner */}
      <section className="py-16 px-4 md:px-8 border-t border-dark-900 bg-dark-950">
        <div className="max-w-4xl mx-auto glass-panel border border-dark-850 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Iniciativa Cidades Inteligentes</h3>
            <p className="text-sm text-dark-300 leading-relaxed mt-1">
              O W-Guard alinha-se diretamente com os conceitos de **Smart Cities**, resolvendo problemas diários tanto no âmbito individual (bloqueando a tarifação injusta de ar na rede e detectando vazamentos residenciais) quanto no coletivo (permitindo o monitoramento de bueiros e redes pluviais urbanas para a mitigação de inundações).
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-900 bg-dark-950 text-xs text-dark-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-dark-900 flex items-center justify-center text-brand-400 border border-dark-800">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-wider font-display">W-GUARD</span>
          </div>

          {/* Academic Info */}
          <div className="text-center md:text-right">
            <p>Projeto Desenvolvido para a Disciplina de Engenharia de Software</p>
            <p className="mt-1">Orientador: Prof. André Saraiva | Data de Abertura: 14/08/2024</p>
            <p className="mt-2 text-dark-600">© 2026 W-Guard Project. Desenvolvido em React + TypeScript + Tailwind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
