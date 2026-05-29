import { ShieldCheck, Cpu, Smartphone, Activity, Wifi } from 'lucide-react';

export default function ProductFeatures() {
  const features = [
    {
      title: "Smart Hidrômetro com Bloqueador de Ar",
      category: "HARDWARE RESIDENCIAL",
      desc: "Equipado com sensor de vazão de alta precisão e algoritmos embarcados de filtragem. Identifica a densidade do ar em alta velocidade, anulando a rotação de leitura e gerando economia real e imediata na fatura.",
      icon: Cpu,
      highlights: ["Precisão de medição > 95%", "100% de correção de erro de ar", "Microcontrolador de baixo consumo"]
    },
    {
      title: "Energy Harvesting Hidráulico",
      category: "AUTOSSUSTENTABILIDADE",
      desc: "Alimentado por um minigerador hidráulico integrado à tubulação. A própria passagem do fluxo de água gera energia mecânica que é convertida e armazenada em supercapacitores, garantindo total autonomia energética do hardware.",
      icon: Activity,
      highlights: ["Independência de pilhas ou rede elétrica", "Recarga contínua em cada uso", "Longo ciclo de vida útil"]
    },
    {
      title: "Módulo Urbano (Bueiro Inteligente)",
      category: "GESTÃO E PREVENÇÃO PÚBLICA",
      desc: "Sensor ultrassônico de nível de preenchimento e detecção de obstruções. Instalado em bueiros urbanos críticos para enviar dados georreferenciados contínuos de riscos de transbordamento.",
      icon: Wifi,
      highlights: ["Prevenção preditiva de alagamentos", "Rede de longo alcance LoRa (até 500m)", "Chassi robusto IP68 contra água e detritos"]
    },
    {
      title: "App Mobile & Dashboard Analytics",
      category: "SOFTWARE INTEGRADO",
      desc: "Aplicativo mobile para monitoramento e corte remoto via smartphone, aliado a um painel web centralizado para prefeituras e órgãos públicos gerenciarem os alertas urbanos e planejarem intervenções de saneamento.",
      icon: Smartphone,
      highlights: ["Interface em tempo real", "Fechamento de registro à distância", "Mapeamento urbano de riscos (Smart Cities)"]
    }
  ];

  return (
    <section id="features" className="py-20 px-4 md:px-8 border-t border-dark-800 bg-dark-950/40 relative">
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-wider text-brand-400 uppercase bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Características do Sistema
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4 text-gradient-cyan-blue">
            Entregas e Diferenciais Tecnológicos
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Uma solução modular que une hardware de ponta e software inteligente para revolucionar o consumo hídrico privado e a prevenção de desastres urbanos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel hover:glass-panel-glow rounded-2xl border border-dark-800 p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-widest font-mono">
                      {feature.category}
                    </span>
                    <div className="p-3 bg-dark-900 rounded-xl text-brand-400 group-hover:bg-brand-500 group-hover:text-white border border-dark-850 group-hover:border-brand-400 transition-all duration-300 shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-dark-400 leading-relaxed mb-6">
                    {feature.desc}
                  </p>
                </div>

                <div className="border-t border-dark-850 pt-5 mt-auto">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {feature.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2 text-xs text-dark-300">
                        <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
