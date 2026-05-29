import { useState, useEffect, useRef } from 'react';
import { ToggleLeft, ToggleRight, Battery, Droplet, Zap, ShieldCheck, Siren, Sliders, AlertTriangle } from 'lucide-react';

export default function InteractiveSimulator() {
  // Residential States
  const [isValveOpen, setIsValveOpen] = useState(true);
  const [isAirPresent, setIsAirPresent] = useState(false);
  const [accumulatedSavings, setAccumulatedSavings] = useState(0.00);
  const [supercapacitorCharge, setSupercapacitorCharge] = useState(85);
  
  // Urban States
  const [drainObstruction, setDrainObstruction] = useState(30);

  // Live Chart Points (stores y-coordinates representing water and air flow)
  const [chartData, setChartData] = useState<{ water: number[]; air: number[] }>({
    water: Array(20).fill(12),
    air: Array(20).fill(0)
  });

  const timerRef = useRef<any>(null);

  // Simulation Loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setChartData((prev) => {
        // Calculate next points based on states
        let nextWater = 0;
        let nextAir = 0;

        if (isValveOpen) {
          if (isAirPresent) {
            // Water flows but air bubbles in
            nextWater = 8 + Math.random() * 3;
            nextAir = 6 + Math.random() * 4;
            // Accumulate savings (prevented air billing)
            setAccumulatedSavings((prevSav) => prevSav + 0.04);
          } else {
            // Normal clean water flow
            nextWater = 12 + Math.random() * 2;
            nextAir = 0;
          }
          // Energy harvesting charging state
          setSupercapacitorCharge((prevCharge) => Math.min(100, +(prevCharge + 0.1).toFixed(1)));
        } else {
          // Valve closed
          nextWater = 0;
          nextAir = 0;
          // Supercapacitor slowly drains when idle
          setSupercapacitorCharge((prevCharge) => Math.max(20, +(prevCharge - 0.05).toFixed(2)));
        }

        const newWaterList = [...prev.water.slice(1), nextWater];
        const newAirList = [...prev.air.slice(1), nextAir];

        return { water: newWaterList, air: newAirList };
      });
    }, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isValveOpen, isAirPresent]);

  // Current Metrics
  const currentWaterFlow = isValveOpen ? (isAirPresent ? 9.2 : 12.8) + (Math.random() * 0.4 - 0.2) : 0;
  const energyHarvestingPower = isValveOpen ? 45.2 : 0; // in mW

  // Get alert color for bueiro drain obstruction
  const getDrainStatus = () => {
    if (drainObstruction < 50) return { label: 'Normal', color: 'text-green-400 bg-green-500/10 border-green-500/20', fill: 'bg-green-500' };
    if (drainObstruction < 80) return { label: 'Atenção (Obstrução Média)', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', fill: 'bg-yellow-500' };
    return { label: 'Crítico (Risco de Alagamento)', color: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse', fill: 'bg-red-500' };
  };

  const drainStatus = getDrainStatus();

  return (
    <section id="simulator" className="py-20 px-4 md:px-8 border-t border-dark-800 bg-dark-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-wider text-brand-400 uppercase bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Laboratório Interativo
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-3 mb-4 text-gradient-cyan-blue">
            Simulador IoT em Tempo Real
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Interaja diretamente com o hardware do W-Guard. Controle a válvula residencial, injete ar na tubulação e monitore bueiros inteligentes.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: RESIDENTIAL CONTROLLER (L: 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between glass-panel rounded-2xl border border-dark-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 mb-6 border-b border-dark-800 pb-4">
                <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400 border border-brand-500/20">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Unidade Residencial</h3>
                  <p className="text-xs text-dark-400">Smart Hidrômetro & Atuador de Válvula</p>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Control 1: Valve State */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-850">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Válvula de Fluxo (Corte)</span>
                    <span className="text-xs text-dark-400">Fechar/Abrir via aplicativo mobile</span>
                  </div>
                  <button 
                    onClick={() => setIsValveOpen(!isValveOpen)}
                    className="focus:outline-none transition-colors"
                  >
                    {isValveOpen ? (
                      <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm">
                        <span>ABERTA</span>
                        <ToggleRight className="w-10 h-10 text-brand-500 cursor-pointer" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                        <span>FECHADA</span>
                        <ToggleLeft className="w-10 h-10 text-dark-600 cursor-pointer" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Control 2: Inject Air */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/50 border border-dark-850">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Injetar Ar na Rede</span>
                    <span className="text-xs text-dark-400">Simular erro gerado pela distribuidora</span>
                  </div>
                  <button
                    disabled={!isValveOpen}
                    onClick={() => setIsAirPresent(!isAirPresent)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300 ${
                      !isValveOpen 
                        ? 'opacity-40 cursor-not-allowed border-dark-800 text-dark-500'
                        : isAirPresent
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                          : 'bg-dark-900 text-dark-300 border-dark-800 hover:border-dark-600 hover:text-white'
                    }`}
                  >
                    {isAirPresent ? "REMOVER AR" : "INJETAR AR"}
                  </button>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex flex-col justify-between">
                  <div className="flex justify-between items-start text-dark-400 mb-2">
                    <span className="text-xs font-semibold">Vazão Consumida</span>
                    <Droplet className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">
                    {currentWaterFlow.toFixed(1)} <span className="text-xs text-dark-400 font-sans">L/min</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex flex-col justify-between">
                  <div className="flex justify-between items-start text-dark-400 mb-2">
                    <span className="text-xs font-semibold">Geração Hídrica</span>
                    <Zap className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-brand-400">
                    {energyHarvestingPower.toFixed(1)} <span className="text-xs text-dark-400 font-sans">mW</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex flex-col justify-between">
                  <div className="flex justify-between items-start text-dark-400 mb-2">
                    <span className="text-xs font-semibold">Autonomia (Bateria)</span>
                    <Battery className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {supercapacitorCharge}%
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-dark-900/30 border border-dark-850 flex flex-col justify-between">
                  <div className="flex justify-between items-start text-dark-400 mb-2">
                    <span className="text-xs font-semibold">Economia Ativa</span>
                    <span className="text-[10px] text-green-400 font-bold font-mono">🛡️ W-GUARD</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-green-400">
                    R$ {accumulatedSavings.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Notification Banner */}
            <div className="mt-6">
              {isAirPresent && isValveOpen ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3 items-center text-xs text-amber-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <p className="leading-relaxed">
                    <span className="font-bold">Alerta de Ar:</span> Ar detectado na rede! Algoritmo de filtragem lógica ativado. A cobrança indevida foi zerada (100% de correção).
                  </p>
                </div>
              ) : !isValveOpen ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 items-center text-xs text-red-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <p className="leading-relaxed">
                    <span className="font-bold">Bloqueio Ativo:</span> Válvula fechada remotamente. Fluxo zerado para evitar vazamentos e consumo.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex gap-3 items-center text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <p className="leading-relaxed">
                    <span className="font-bold">Monitoramento Seguro:</span> Medição de fluxo residencial ativa. Hidrômetro autossustentável gerando energia.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN: LIVE GRAPH & URBAN BUEIRO (R: 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Live Chart Panel */}
            <div className="glass-panel rounded-2xl border border-dark-800 p-6 flex flex-col justify-between shadow-xl min-h-[260px]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Fluxo de Telemetria Hídrica</h3>
                  <p className="text-xs text-dark-400">Assinatura de leitura em tempo real nos registros</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-dark-300">Água (L/m)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-dark-300">Ar Detectado</span>
                  </div>
                </div>
              </div>

              {/* SVG Live Graphic Plotter */}
              <div className="relative h-40 w-full bg-dark-950/60 rounded-xl border border-dark-850 p-2 overflow-hidden flex items-end">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none opacity-30">
                  <div className="w-full border-b border-dark-700 text-[9px] text-dark-500 font-mono text-right">Max (20 L/min)</div>
                  <div className="w-full border-b border-dark-800 text-[9px] text-dark-500 font-mono text-right">Med (10 L/min)</div>
                  <div className="w-full text-[9px] text-dark-500 font-mono text-right">Min (0 L/min)</div>
                </div>

                <svg className="w-full h-full" viewBox="0 0 380 150" preserveAspectRatio="none">
                  {/* SVG line for clean water flow */}
                  <path
                    d={`M ${chartData.water.map((pt, i) => `${(i / 19) * 380},${150 - (pt / 20) * 130}`).join(' L ')}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Glowing gradient fill for water */}
                  <path
                    d={`M 0,150 L ${chartData.water.map((pt, i) => `${(i / 19) * 380},${150 - (pt / 20) * 130}`).join(' L ')} L 380,150 Z`}
                    fill="url(#water-gradient)"
                    opacity="0.1"
                    className="transition-all duration-300"
                  />

                  {/* SVG line for air flow */}
                  <path
                    d={`M ${chartData.air.map((pt, i) => `${(i / 19) * 380},${150 - (pt / 20) * 130}`).join(' L ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="water-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Urban Bueiro Panel */}
            <div className="glass-panel rounded-2xl border border-dark-800 p-6 flex flex-col md:flex-row justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 border border-teal-500/20">
                      <Siren className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Unidade Urbana (Módulo Bueiro)</h3>
                      <p className="text-xs text-dark-400">Prevenção ativa de enchentes & obstruções</p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-dark-400 mb-6">
                    Ajuste o controle deslizante para simular o acúmulo de sedimentos e nível de água da chuva no bueiro urbano. Acima de 80%, um alerta preventivo georreferenciado é disparado para a central de saneamento municipal.
                  </p>
                </div>

                {/* Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-dark-300 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" /> Nível de Obstrução
                    </span>
                    <span className="text-white font-mono text-sm">{drainObstruction}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={drainObstruction}
                    onChange={(e) => setDrainObstruction(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-dark-900 appearance-none cursor-pointer accent-brand-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-dark-500 font-mono">
                    <span>Vazio (0%)</span>
                    <span>50%</span>
                    <span>Obstruído (100%)</span>
                  </div>
                </div>
              </div>

              {/* Visual Bueiro Model */}
              <div className="w-full md:w-44 flex flex-col items-center gap-2 shrink-0">
                {/* Physical representation of a storm drain */}
                <div className="w-24 h-40 bg-dark-900 border-2 border-dark-850 rounded-xl relative overflow-hidden flex flex-col justify-end">
                  {/* Bueiro Grate Lines */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-dark-800 border-b border-dark-950 grid grid-cols-6 gap-0.5 px-1 py-0.5 z-10">
                    <div className="bg-dark-950 h-full rounded-sm" />
                    <div className="bg-dark-950 h-full rounded-sm" />
                    <div className="bg-dark-950 h-full rounded-sm" />
                    <div className="bg-dark-950 h-full rounded-sm" />
                    <div className="bg-dark-950 h-full rounded-sm" />
                    <div className="bg-dark-950 h-full rounded-sm" />
                  </div>

                  {/* Water Fill height determined by state */}
                  <div
                    style={{ height: `${drainObstruction}%` }}
                    className={`w-full transition-all duration-500 rounded-b-lg ${drainStatus.fill} opacity-60 relative`}
                  >
                    {/* Sediment level representation */}
                    <div
                      style={{ height: `${Math.min(100, drainObstruction * 0.4)}%` }}
                      className="absolute bottom-0 inset-x-0 bg-amber-950/70 border-t border-amber-900/50 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${drainStatus.color}`}>
                  {drainStatus.label}
                </span>

                {/* Alert Warning Text */}
                {drainObstruction >= 80 && (
                  <div className="w-full p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-1.5 text-[10px] text-red-400 mt-2 leading-tight animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <span>ALERTA ENVIADO: Equipe de desobstrução preventiva recomendada para o local!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
