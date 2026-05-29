import { User, Shield, GraduationCap } from 'lucide-react';

export default function TeamSection() {
  const manager = {
    name: "João Vitor",
    role: "Líder Técnico / Desenvolvedor",
    desc: "+3 anos em desenvolvimento de software | Gestão de equipes Dev | Apps escaláveis | Arquitetura de software | Banco de Dados"
  };

  const advisor = {
    name: "Prof. André Saraiva",
    role: "Orientador Acadêmico & Aprovador",
    desc: "Supervisão metodológica | Validação técnica das premissas de engenharia | Alinhamento pedagógico de software"
  };

  const members = [
    {
      name: "André Nascimento",
      role: "Empreendedor de Negócios",
      desc: "Empreendedorismo estratégico | Visão de mercado e soluções escaláveis | Alinhamento cliente-técnico"
    },
    {
      name: "Guilherme Paranhos",
      role: "Sensoriamento Remoto",
      desc: "Geoprocessamento e gestão de dados | Análise de rede de abastecimento | Documentação, testes e validação de sistema | Eficiência hídrica"
    },
    {
      name: "Joseph Carvalho",
      role: "Marketing Digital",
      desc: "Estratégias de marketing digital | Tráfego pago e posicionamento orgânico | Otimização de investimentos | Jornada do cliente"
    },
    {
      name: "Rafael Santos",
      role: "Analista de Suporte & Analista de QA",
      desc: "Análise de Suporte e QA | Blindagem da experiência do cliente | Produto livre de falhas | Satisfação e retenção do usuário"
    },
    {
      name: "Rony",
      role: "Técnico Instalação",
      desc: "Instalação e manutenção de equipamentos | Experiência em obras residenciais e prediais | Garantia de funcionamento e segurança"
    },
    {
      name: "Leonardo Lima",
      role: "Cyber Security / Projetista 3D",
      desc: "+25 anos em TI e segurança da informação | Administração de redes (Linux/Windows) e SOC | Eletrônica aplicada e DPOAs | Modelagem e impressão 3D"
    }
  ];

  return (
    <section id="team" className="py-20 px-4 md:px-8 border-t border-dark-800 bg-dark-950/20 relative">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-wider text-brand-400 uppercase bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Equipe do Projeto
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4 text-gradient-cyan-blue">
            Quem Desenvolveu o W-Guard
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Uma equipe multidisciplinar de estudantes de Engenharia de Software focada em inovação urbana, defesa do consumidor e sustentabilidade.
          </p>
        </div>

        {/* Highlighted Lead and Advisor Card Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Manager Card */}
          <div className="glass-panel border-brand-500/30 bg-brand-950/5 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-brand-500/50 transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  Liderança Técnica
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-300 transition-colors duration-300">
                {manager.name}
              </h3>
              <p className="text-xs font-semibold text-brand-400 font-mono mb-3">
                {manager.role}
              </p>
              <p className="text-sm text-dark-300 leading-relaxed font-medium">
                {manager.desc}
              </p>
            </div>
            <div className="flex gap-3 mt-6 border-t border-dark-850 pt-4 text-dark-500">
              <span className="text-[10px] uppercase font-mono tracking-wider text-dark-500">W-Guard Lead</span>
            </div>
          </div>

          {/* Advisor Card */}
          <div className="glass-panel border-teal-500/30 bg-teal-950/5 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Supervisão
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-teal-300 transition-colors duration-300">
                {advisor.name}
              </h3>
              <p className="text-xs font-semibold text-teal-400 font-mono mb-3">
                {advisor.role}
              </p>
              <p className="text-sm text-dark-300 leading-relaxed">
                {advisor.desc}
              </p>
            </div>
            <div className="flex gap-3 mt-6 border-t border-dark-850 pt-4 text-dark-500">
              <span className="text-[10px] uppercase font-mono tracking-wider text-dark-500">Aprovador e Orientador Acadêmico</span>
            </div>
          </div>
        </div>

        {/* Developer Team Grid */}
        <h4 className="text-center font-bold text-xs uppercase tracking-widest text-dark-500 mb-6 font-mono">
          Equipe de Engenharia e Negócios
        </h4>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-5 rounded-xl border border-dark-850 hover:border-dark-750 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-dark-900 flex items-center justify-center text-dark-400 mb-4 group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-all duration-300">
                  <User className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-white group-hover:text-brand-300 transition-colors duration-300">
                  {member.name}
                </h5>
                <p className="text-[11px] text-brand-400 font-mono mt-1 font-semibold leading-normal">
                  {member.role}
                </p>
                <p className="text-xs text-dark-300 mt-3 leading-relaxed">
                  {member.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
