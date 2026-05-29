import { useState } from 'react';
import { FileText, GitBranch, Calendar, Shield, Users, Award, Landmark, CheckCircle2, Info, Coins, Clock, UserCheck, AlertTriangle } from 'lucide-react';

export default function TAPViewer() {
  const [activeTab, setActiveTab] = useState<'document' | 'architecture' | 'timeline'>('document');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const tapData = {
    title: "TERMO DE ABERTURA DO PROJETO (TAP)",
    project: "SISTEMA IOT DE MONITORAMENTO HÍDRICO AUTOSSUSTENTÁVEL COM DETECÇÃO DE AR.",
    manager: "JOÃO VITOR DE JESUS SOUZA",
    team: "João Vitor Souza, Rony, André Nascimento, Guilherme Paranhos, Leonardo Lima, Joseph Carvalho, Rafael Santos",
    approvedBy: "Prof. André Saraiva",
    version: "1.0",
    date: "05/2026",
    sections: [
      {
        id: "1",
        title: "CLIENTE",
        icon: Users,
        content: "Pessoa Física e Pessoa Jurídica"
      },
      {
        id: "2",
        title: "PATROCINADOR",
        icon: Landmark,
        content: "Coordenação de Extensão ou Departamento de Engenharia e/ou Secretarias Municipais de Infraestrutura/Saneamento"
      },
      {
        id: "3",
        title: "DESCRIÇÃO DO PROJETO",
        icon: FileText,
        content: "O projeto consiste no desenvolvimento de um Ecossistema IoT de Monitoramento Hídrico Autossustentável. O sistema utiliza um dispositivo instalado no registro residencial que mede o consumo de água, detecta a passagem indevida de ar e permite o fechamento remoto do fluxo via aplicativo. O hardware é alimentado por um minigerador hidráulico, garantindo autonomia energética. Adicionalmente, o sistema prevê módulos para monitoramento de bueiros urbanos, visando a identificação precoce de obstruções e prevenção de alagamentos."
      },
      {
        id: "4",
        title: "JUSTIFICATIVA DO PROJETO",
        icon: Shield,
        content: "A falta de transparência na medição de consumo e a cobrança indevida por 'ar na rede' geram prejuízos financeiros diretos ao consumidor. Além disso, a gestão pública enfrenta desafios na manutenção preventiva de bueiros, agindo apenas após transbordamentos. Este projeto justifica-se pela necessidade de soluções de baixo custo que promovam a eficiência hídrica, defesa do consumidor, utilizando tecnologias de cidades inteligentes (Smart Cities) para resolver problemas do cotidiano."
      },
      {
        id: "5",
        title: "OBJETIVOS (SMART) E METAS",
        icon: Award,
        content: "Desenvolver um protótipo funcional de hidrômetro inteligente para reduzir em 70% o erro de leitura, poderá ser utilizado em propriedades residências no prazo de 2 anos analisando o resultado em 5 casas em bairros distintos."
      },
      {
        id: "6",
        title: "PRODUTO E ENTREGAS",
        icon: CheckCircle2,
        content: "• Hardware Residencial (Smart Hidrômetro): Dispositivo IoT equipado com sensor de fluxo de alta precisão, bloqueador físico/lógico de ar e atuador para fechamento remoto do registro. Possui sistema de energia sustentável via minigerador hidráulico para operação autossustentável.\n• Módulo de Monitoramento Urbano: Sensor robusto para instalação em bueiros, capaz de detectar níveis de obstrução e volume de escoamento para prevenção de alagamentos.\n• Aplicativo Mobile (Interface do Usuário): Aplicação para smartphones que permite ao consumidor monitorar o consumo em tempo real, receber alertas de vazamentos ou presença de ar, e realizar o corte/abertura do fluxo de água à distância.\n• Dashboard de Gestão Pública: Painel de controle destinado a órgãos municipais para visualização geográfica de alertas de bueiros e análise de dados hídricos em larga escala (Smart City)."
      },
      {
        id: "7",
        title: "PREMISSAS",
        icon: Info,
        content: "• Infraestrutura de Rede: Assume-se que a residência do usuário possua conexão Wi-Fi ativa\n• Acesso ao Local de Instalação: Premissa de que o morador autorizará o acesso físico ao registro de água ou aos bueiros selecionados para os testes de campo.\n• Compatibilidade de Sinal: Assume-se que a distância entre o registro de água (externo) e o receptor (interno) seja compatível com o alcance da tecnologia LoRa (tipicamente até 500m em áreas urbanas com obstáculos)."
      },
      {
        id: "8",
        title: "ESTIMATIVA DE CUSTOS",
        icon: Coins,
        content: "• Mão de obra: R$1.152.000,00\n• Equipamentos: R$600,00 / Produto\n• Hospedagem: R$36.000,00\n• Estimativa Total: R$1.188.600,00"
      },
      {
        id: "9",
        title: "ESTIMATIVA DE PRAZO",
        icon: Clock,
        content: "1 ano e 6 meses"
      },
      {
        id: "10",
        title: "PARTES INTERESSADAS",
        icon: UserCheck,
        content: "André Saraiva e alunos do grupo"
      },
      {
        id: "11",
        title: "RISCOS",
        icon: AlertTriangle,
        content: "1. Falta de internet na residência\n2. Falta de energia elétrica\n3. Entupimento na tubulação de água\n4. Falha na segurança de dados\n5. Oxidação e Corrosão do equipamento\n6. Instalação indevida no sistema hídrico\n7. Perda de configuração do receptor no dispositivo móvel\n8. Sobrecarga de energia elétrica no receptor\n9. Interferência no sinal via rádio de equipamentos na mesma frequência\n10. Lote de matéria-prima defeituoso"
      }
    ]
  };

  const timelineSteps = [
    { period: "Período 1 & 2", title: "Pesquisa e Design de Hardware", desc: "Estudo de viabilidade de sensores, dimensionamento do minigerador hidráulico e design lógico do filtro de detecção de ar. Modelagem 3D dos acoplamentos." },
    { period: "Período 3", title: "Montagem do Protótipo & Firmware", desc: "Desenvolvimento do circuito elétrico inicial, calibração dos sensores de fluxo, programação das rotinas embarcadas para detecção de ar e controle de energia." },
    { period: "Período 4", title: "Software & Protocolos de Rede", desc: "Criação do aplicativo móvel, integração com gateway LoRa/Wi-Fi e envio dos dados simulados para a nuvem. Testes básicos de fechamento remoto da válvula." },
    { period: "Período 5", title: "Módulo Urbano & Painel Smart City", desc: "Desenvolvimento do sensor físico para bueiros urbanos (ultrassônico de nível) e criação do dashboard web para visualização de alertas pelas prefeituras." },
    { period: "Período 6", title: "Testes de Campo & Validação", desc: "Instalação controlada em registros reais de voluntários e em bueiros urbanos críticos. Validação da precisão (>95%) e eficácia do bloqueio de ar (100% de precisão)." }
  ];

  return (
    <section id="tap" className="relative py-20 px-4 md:px-8 border-t border-dark-800 bg-dark-950/50">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-wider text-brand-400 uppercase bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Documentação do Projeto
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4 text-gradient-cyan-blue">
            Termo de Abertura do Projeto (TAP)
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            A base metodológica e o escopo estruturado do W-Guard, formalizando sua engenharia técnica e compromisso pedagógico.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
          <button
            onClick={() => setActiveTab('document')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
              activeTab === 'document'
                ? 'bg-brand-500 text-white border-brand-400 shadow-lg shadow-brand-500/20'
                : 'bg-dark-900/50 text-dark-300 border-dark-850 hover:border-dark-700 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documento Técnico
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
              activeTab === 'architecture'
                ? 'bg-brand-500 text-white border-brand-400 shadow-lg shadow-brand-500/20'
                : 'bg-dark-900/50 text-dark-300 border-dark-850 hover:border-dark-700 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Visualização de Arquitetura
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
              activeTab === 'timeline'
                ? 'bg-brand-500 text-white border-brand-400 shadow-lg shadow-brand-500/20'
                : 'bg-dark-900/50 text-dark-300 border-dark-850 hover:border-dark-700 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Cronograma (6 Semestres)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-dark-800 p-6 md:p-8">
          
          {/* TAB 1: TAP Document Table */}
          {activeTab === 'document' && (
            <div className="animate-fadeIn duration-500">
              <div className="border border-dark-850 rounded-xl overflow-hidden shadow-2xl">
                {/* Header Title Grid */}
                <div className="bg-dark-900 p-6 border-b border-dark-850 text-center">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">{tapData.title}</h3>
                  <p className="text-brand-400 font-semibold mt-1 text-sm md:text-base">{tapData.project}</p>
                  <p className="text-xs text-dark-400 mt-2">GERENTE DO PROJETO: <span className="text-dark-200 font-medium">{tapData.manager}</span></p>
                </div>

                {/* Sub-Header Metadata Table */}
                <div className="grid grid-cols-2 md:grid-cols-4 bg-dark-950 border-b border-dark-850 text-xs md:text-sm">
                  <div className="p-4 border-r border-b md:border-b-0 border-dark-850">
                    <span className="block text-dark-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Preparado Por</span>
                    <span className="text-dark-200 line-clamp-2 md:line-clamp-none" title={tapData.team}>
                      {tapData.team}
                    </span>
                  </div>
                  <div className="p-4 border-r border-b md:border-b-0 border-dark-850">
                    <span className="block text-dark-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Aprovado Por</span>
                    <span className="text-dark-200 font-medium">{tapData.approvedBy}</span>
                  </div>
                  <div className="p-4 border-r border-dark-850">
                    <span className="block text-dark-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Versão</span>
                    <span className="text-brand-400 font-bold font-mono">{tapData.version}</span>
                  </div>
                  <div className="p-4">
                    <span className="block text-dark-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">Data</span>
                    <span className="text-dark-200 font-mono">{tapData.date}</span>
                  </div>
                </div>

                {/* Main Content Sections */}
                <div className="divide-y divide-dark-850 bg-dark-900/20">
                  {tapData.sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <div key={section.id} className="grid md:grid-cols-12 p-6 gap-4 items-start hover:bg-dark-900/40 transition-colors duration-200">
                        <div className="md:col-span-3 flex items-center gap-3">
                          <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400 border border-brand-500/20">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-sm md:text-base text-dark-100 tracking-wider">
                            {section.id}. {section.title}
                          </h4>
                        </div>
                        <div className="md:col-span-9 text-dark-300 text-sm leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pedagogical Note */}
              <div className="mt-8 p-4 bg-brand-950/20 rounded-xl border border-brand-900/40 flex gap-4 items-start">
                <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-brand-300 mb-1">Nota de Alinhamento Pedagógico</h4>
                  <p className="text-xs md:text-sm text-dark-400 leading-relaxed">
                    Este projeto reflete a integração ativa entre teoria e prática na Engenharia de Software. Serve como "laboratório vivo" para o desenvolvimento de competências técnicas cruciais (IoT, Firmware embarcado, Protocolos de Rede e Engenharia de Software Móvel/Web) associadas a competências humanas essenciais, como colaboração em equipe multidisciplinar, liderança ágil e senso crítico de responsabilidade social e ambiental.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Architecture SVG */}
          {activeTab === 'architecture' && (
            <div className="animate-fadeIn duration-500 flex flex-col items-center">
              <div className="w-full text-center mb-6">
                <h3 className="text-lg font-bold text-white">Fluxo do Ecossistema Integrado W-Guard</h3>
                <p className="text-xs text-dark-400 mt-1">Passe o mouse sobre os blocos da arquitetura para visualizar o papel e responsabilidade de cada componente.</p>
              </div>

              {/* Interactive SVG Diagram Container */}
              <div className="relative w-full max-w-4xl p-2 bg-dark-950/80 rounded-xl border border-dark-850 overflow-x-auto select-none">
                <svg viewBox="0 0 880 500" className="w-full min-w-[760px] h-auto font-sans" xmlns="http://www.w3.org/2000/svg">
                  {/* Definition for Grid Background & Glow Filters */}
                  <defs>
                    <linearGradient id="cyan-blue-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <filter id="glow-effect" x="-10%" y="-10%" width="120%" height="120%">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Component Group: HARDWARE */}
                  <rect x="20" y="30" width="280" height="440" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" strokeDasharray="5 5" />
                  <text x="35" y="55" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="1">HARDWARE DE CAMPO (RESIDENCIAL & URBANO)</text>

                  {/* HW Block 1: Tubulação / Fluxo */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('water_source')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="40" y="80" width="240" height="70" rx="8" 
                      fill={hoveredNode === 'water_source' ? '#134e4a' : '#1e293b'} 
                      stroke={hoveredNode === 'water_source' ? '#2dd4bf' : '#334155'} strokeWidth="1.5" />
                    <text x="60" y="110" fill="#ffffff" fontSize="13" fontWeight="bold">Fluxo de Água & Tubulação</text>
                    <text x="60" y="130" fill="#94a3b8" fontSize="11">Rede de água da concessionária</text>
                  </g>

                  {/* HW Block 2: Minigerador */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('generator')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="40" y="170" width="240" height="70" rx="8" 
                      fill={hoveredNode === 'generator' ? '#134e4a' : '#1e293b'} 
                      stroke={hoveredNode === 'generator' ? '#2dd4bf' : '#334155'} strokeWidth="1.5" />
                    <text x="60" y="200" fill="#ffffff" fontSize="13" fontWeight="bold">🔋 Minigerador Hidráulico</text>
                    <text x="60" y="220" fill="#94a3b8" fontSize="11">Gera energia autossustentável</text>
                  </g>

                  {/* HW Block 3: Smart Hidrometro */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('sensor_main')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="40" y="260" width="240" height="90" rx="8" 
                      fill={hoveredNode === 'sensor_main' ? '#115e59' : '#1e293b'} 
                      stroke={hoveredNode === 'sensor_main' ? '#14b8a6' : '#334155'} strokeWidth="2"
                      filter={hoveredNode === 'sensor_main' ? 'url(#glow-effect)' : ''} />
                    <text x="60" y="290" fill="#2dd4bf" fontSize="13" fontWeight="bold">🛡️ Smart Hidrômetro + Ar</text>
                    <text x="60" y="312" fill="#e2e8f0" fontSize="11">Medidor e Bloqueador de Ar</text>
                    <text x="60" y="330" fill="#94a3b8" fontSize="10">ESP32 + Sensores Hídricos</text>
                  </g>

                  {/* HW Block 4: Valvula */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('valve')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="40" y="370" width="115" height="80" rx="8" 
                      fill={hoveredNode === 'valve' ? '#134e4a' : '#1e293b'} 
                      stroke={hoveredNode === 'valve' ? '#2dd4bf' : '#334155'} strokeWidth="1.5" />
                    <text x="50" y="405" fill="#ffffff" fontSize="11" fontWeight="bold">🚰 Válvula de Corte</text>
                    <text x="50" y="425" fill="#94a3b8" fontSize="9">Bloqueio Físico Remoto</text>
                  </g>

                  {/* HW Block 5: Sensor Bueiro */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('bueiro_sensor')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="165" y="370" width="115" height="80" rx="8" 
                      fill={hoveredNode === 'bueiro_sensor' ? '#134e4a' : '#1e293b'} 
                      stroke={hoveredNode === 'bueiro_sensor' ? '#2dd4bf' : '#334155'} strokeWidth="1.5" />
                    <text x="175" y="405" fill="#ffffff" fontSize="11" fontWeight="bold">🕳️ Sensor Bueiro</text>
                    <text x="175" y="425" fill="#94a3b8" fontSize="9">Nível de Obstrução</text>
                  </g>


                  {/* Component Group: GATEWAY & CLOUD */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('gateway')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="360" y="110" width="160" height="90" rx="10" 
                      fill={hoveredNode === 'gateway' ? '#134e4a' : '#1e293b'} 
                      stroke={hoveredNode === 'gateway' ? '#2dd4bf' : '#3b82f6'} strokeWidth="1.5" />
                    <text x="380" y="145" fill="#ffffff" fontSize="14" fontWeight="bold">📡 Gateway IoT</text>
                    <text x="380" y="165" fill="#38bdf8" fontSize="12" fontWeight="bold">LoRaWAN / Wi-Fi</text>
                    <text x="380" y="182" fill="#94a3b8" fontSize="10">Alcance de até 500m</text>
                  </g>

                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('cloud')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="360" y="270" width="160" height="90" rx="10" 
                      fill={hoveredNode === 'cloud' ? '#1e3a8a' : '#1e293b'} 
                      stroke={hoveredNode === 'cloud' ? '#3b82f6' : '#334155'} strokeWidth="2" />
                    <text x="380" y="305" fill="#ffffff" fontSize="14" fontWeight="bold">☁️ Cloud Server</text>
                    <text x="380" y="325" fill="#93c5fd" fontSize="12">InfluxDB & NodeRed</text>
                    <text x="380" y="342" fill="#94a3b8" fontSize="10">Histórico de Gastos</text>
                  </g>


                  {/* Component Group: INTERFACES */}
                  <rect x="580" y="30" width="280" height="440" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" strokeDasharray="5 5" />
                  <text x="595" y="55" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="1">INTERFACES & VISUALIZAÇÃO</text>

                  {/* Interface Block 1: App Mobile */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('app')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="600" y="80" width="240" height="150" rx="8" 
                      fill={hoveredNode === 'app' ? '#1e3b8b' : '#1e293b'} 
                      stroke={hoveredNode === 'app' ? '#3b82f6' : '#334155'} strokeWidth="2"
                      filter={hoveredNode === 'app' ? 'url(#glow-effect)' : ''} />
                    <text x="620" y="115" fill="#3b82f6" fontSize="14" fontWeight="bold">📱 App Mobile (Usuário)</text>
                    <text x="620" y="145" fill="#ffffff" fontSize="12">✔ Consumo de água em tempo real</text>
                    <text x="620" y="170" fill="#ffffff" fontSize="12">✔ Alertas de ar na rede (Tarifação)</text>
                    <text x="620" y="195" fill="#ffffff" fontSize="12">✔ Fechamento remoto do fluxo</text>
                  </g>

                  {/* Interface Block 2: Dashboard Cities */}
                  <g 
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredNode('dashboard')}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x="600" y="270" width="240" height="150" rx="8" 
                      fill={hoveredNode === 'dashboard' ? '#134e4a' : '#1e293b'} 
                      stroke={hoveredNode === 'dashboard' ? '#2dd4bf' : '#334155'} strokeWidth="1.5" />
                    <text x="620" y="305" fill="#2dd4bf" fontSize="14" fontWeight="bold">📊 Painel Smart Cities</text>
                    <text x="620" y="335" fill="#ffffff" fontSize="12">✔ Monitoramento de bueiros urbanos</text>
                    <text x="620" y="360" fill="#ffffff" fontSize="12">✔ Alarmes preventivos de alagamento</text>
                    <text x="620" y="385" fill="#ffffff" fontSize="12">✔ Planejamento urbano proativo</text>
                  </g>

                  {/* CONNECTING ARROWS */}
                  
                  {/* Flow/Tubulação to Minigerador (water spins generator) */}
                  <path d="M 160,150 L 160,170" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" />
                  
                  {/* Minigerador to Smart Hidrometro (powers it) */}
                  <path d="M 100,240 L 100,260" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="105" y="254" fill="#f59e0b" fontSize="8" fontWeight="bold">ENERGIA (mW)</text>
                  
                  {/* Flow/Tubulação to Smart Hidrometro (water flow to measure) */}
                  <path d="M 220,150 L 220,260" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  
                  {/* Smart Hidrometro to Gateway (sends telemetry) */}
                  <path d="M 280,305 L 360,170" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray={hoveredNode === 'sensor_main' ? "0" : "4"} />
                  <text x="300" y="240" fill="#10b981" fontSize="9" transform="rotate(-30 300 240)">CONSUMO & AR</text>

                  {/* Sensor Bueiro to Gateway (sends flood telemetry) */}
                  <path d="M 222,370 L 360,180" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4" />
                  <text x="285" y="352" fill="#10b981" fontSize="9" transform="rotate(-54 285 352)">STATUS BUEIRO</text>

                  {/* Gateway to Cloud (forwards data) */}
                  <path d="M 440,200 L 440,270" fill="none" stroke="#3b82f6" strokeWidth="2" />

                  {/* Cloud to App (serves data) */}
                  <path d="M 520,305 L 600,170" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                  
                  {/* App back to Valve (valve control command) */}
                  <path d="M 680,230 L 680,450 L 100,450 L 100,450 L 100,450" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="310" y="445" fill="#ef4444" fontSize="9" fontWeight="bold">COMANDO FECHAR/ABRIR VÁLVULA (REMOTO)</text>

                  {/* Cloud to Dashboard Cities (alerts public admin) */}
                  <path d="M 520,325 L 600,325" fill="none" stroke="#10b981" strokeWidth="2" />

                  {/* Arrow markers */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Node description box */}
              <div className="w-full max-w-4xl mt-6 p-5 rounded-xl bg-dark-900 border border-dark-800 text-sm">
                <h4 className="font-bold text-brand-400 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" />
                  {hoveredNode === null && "Explorador da Arquitetura"}
                  {hoveredNode === 'water_source' && "1. Fluxo de Água & Tubulação"}
                  {hoveredNode === 'generator' && "2. Minigerador Hidráulico (Energy Harvesting)"}
                  {hoveredNode === 'sensor_main' && "3. Smart Hidrômetro (Com Detecção de Ar)"}
                  {hoveredNode === 'valve' && "4. Válvula de Corte Remoto"}
                  {hoveredNode === 'bueiro_sensor' && "5. Módulo Urbano (Sensor de Bueiro)"}
                  {hoveredNode === 'gateway' && "6. Gateway de Comunicação (Wi-Fi/LoRa)"}
                  {hoveredNode === 'cloud' && "7. Banco de Dados & Cloud Server"}
                  {hoveredNode === 'app' && "8. Aplicativo Mobile (Cidadão)"}
                  {hoveredNode === 'dashboard' && "9. Dashboard Gestão Pública (Prefeitura)"}
                </h4>
                <p className="text-dark-300 leading-relaxed">
                  {hoveredNode === null && "Passe o cursor sobre qualquer componente técnico do diagrama acima para ver detalhes de funcionamento, conectividade e interações no ecossistema W-Guard."}
                  {hoveredNode === 'water_source' && "A tubulação convencional de abastecimento doméstico. O sistema é acoplado diretamente a ela, analisando o fluido em tempo real sem afetar a pressão hídrica."}
                  {hoveredNode === 'generator' && "Um pequeno gerador de fluxo instalado em série. A energia cinética da própria passagem de água gera energia elétrica regulada, que é armazenada em supercapacitores/baterias para alimentar o microcontrolador de forma autossustentável."}
                  {hoveredNode === 'sensor_main' && "O cérebro do hardware. Integra sensores de fluxo e algoritmos avançados para identificar a assinatura de ar (alta velocidade/baixa massa) e realizar a filtragem lógica do erro, garantindo que o consumidor não pague por ar nas tubulações."}
                  {hoveredNode === 'valve' && "Válvula solenoide auto-alimentada de alto torque que fecha ou abre a tubulação imediatamente em resposta a comandos emitidos de forma wireless (via App)."}
                  {hoveredNode === 'bueiro_sensor' && "Sensor ultrassônico blindado instalado na base interna do bueiro. Mede a distância até o lixo/água acumulados e envia as informações de forma intermitente."}
                  {hoveredNode === 'gateway' && "Ponto de recebimento. Em residências, conecta-se ao roteador Wi-Fi local. Para a rede urbana de bueiros, utiliza a tecnologia de rádio LoRa, com longo alcance de até 500 metros em áreas de alta densidade."}
                  {hoveredNode === 'cloud' && "Centraliza a inteligência de nuvem. Armazena leituras cronológicas no banco de dados, gera estatísticas consolidadas e coordena o envio de webhooks e alertas instantâneos de emergência."}
                  {hoveredNode === 'app' && "A interface do morador. Apresenta o consumo em tempo real, audita a fatura gerada com auditoria de ar detectado, envia notificações em caso de vazamento doméstico e permite acionar a válvula remotamente."}
                  {hoveredNode === 'dashboard' && "Painel georreferenciado voltado para a administração pública e equipes de saneamento municipais. Exibe mapas de calor que alertam em tempo real sobre bueiros obstruídos com risco eminente de alagamento."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Timeline */}
          {activeTab === 'timeline' && (
            <div className="animate-fadeIn duration-500">
              <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-white">Cronograma Físico do Projeto</h3>
                <p className="text-xs text-dark-400 mt-1">Estimativa de 6 períodos semestrais (2.5 anos) para o desenvolvimento, testes e validação em ambiente real.</p>
              </div>

              <div className="relative pl-6 border-l border-brand-500/30 max-w-3xl mx-auto space-y-8">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-dark-950 border-2 border-brand-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    </div>

                    <div className="bg-dark-900/40 border border-dark-850/60 p-5 rounded-xl hover:border-brand-500/30 transition-all duration-300">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-widest font-mono bg-brand-500/10 px-2 py-0.5 rounded">
                        {step.period}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2 mb-1">{step.title}</h4>
                      <p className="text-sm text-dark-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
