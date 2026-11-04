/**
 * Dados técnicos do protótipo (TAP + lista de materiais do projeto extensionista).
 * Os valores marcados como "alvo" ou "estimado" ainda não foram validados em campo.
 */

export type MeterPartId = 'cap' | 'pcb' | 'power' | 'sensor' | 'body';

export type MeterPart = {
  id: MeterPartId;
  order: number;
  name: string;
  role: string;
  summary: string;
  description: string;
  badges: string[];
  specs: { label: string; value: string }[];
  bom: string[];
  accent: string;
};

export const METER_PARTS: MeterPart[] = [
  {
    id: 'cap',
    order: 5,
    name: 'Cúpula selada',
    role: 'Proteção IP65 e janela de RF',
    summary: 'Caixa patola estanque com passagem para a antena de 433 MHz.',
    description:
      'Envelope externo que isola a eletrônica da umidade do registro. A tampa recebe o pigtail da antena e mantém o conjunto estanque sem bloquear o sinal LoRa — o plástico é transparente em 433 MHz.',
    badges: ['IP65', 'Antena 433 MHz', 'Pigtail SMA'],
    specs: [
      { label: 'Grau de proteção', value: 'IP65 (jato d’água)' },
      { label: 'Material', value: 'ABS com vedação elastomérica' },
      { label: 'Antena', value: 'Dipolo 433 MHz + pigtail' },
      { label: 'Fixação', value: 'Parafusos inox M4' },
    ],
    bom: ['Caixa Patola Estanque (IP65)', 'Antena 433 MHz com Pigtail'],
    accent: '#38bdf8',
    },
  {
    id: 'pcb',
    order: 4,
    name: 'Placa de controle',
    role: 'Processamento, rádio e acionamento',
    summary: 'ESP32 DevKit V1 + SX1278 (LoRa 433 MHz) + drivers de carga e válvula.',
    description:
      'O cérebro do hidrômetro. O ESP32 conta os pulsos do sensor, aplica o filtro de ar, dorme em deep sleep entre leituras e transmite o pacote pelo SX1278. A mesma placa gerencia a carga da bateria (TP4056) e o acionamento da válvula (L9110S + MT3608).',
    badges: ['ESP32', 'SX1278 · 433 MHz', 'Deep sleep ≈ 25 µA'],
    specs: [
      { label: 'Microcontrolador', value: 'ESP32 DevKit V1 (dual-core 240 MHz)' },
      { label: 'Rádio', value: 'SX1278 · LoRa 433 MHz · +20 dBm' },
      { label: 'Consumo em sleep', value: '≈ 25 µA (alvo de firmware)' },
      { label: 'Alimentação', value: '3,3 V via regulador da DevKit' },
      { label: 'Drivers', value: 'TP4056, L9110S, MT3608' },
    ],
    bom: ['ESP32 DevKit V1', 'Módulo LoRa SX1278 (433 MHz)', 'Módulo TP4056 com Proteção', 'Módulo Driver Ponte H (L9110S)', 'Módulo Step-Up (MT3608)'],
    accent: '#34d399',
    },
  {
    id: 'power',
    order: 3,
    name: 'Pack de energia',
    role: 'Armazenamento e harvesting',
    summary: 'Duas células 18650 em paralelo, recarregadas pelo minigerador hidráulico.',
    description:
      'A energia vem do próprio fluxo de água: o minigerador F50-5V alimenta o TP4056, que carrega duas células 18650 em paralelo. Sem consumo, o sistema entra em deep sleep e a autonomia é medida em meses, não em dias.',
    badges: ['2× 18650', '≈ 19,2 Wh', 'Harvesting 5 V'],
    specs: [
      { label: 'Células', value: '2× Li-Ion 18650 3,7 V (paralelo)' },
      { label: 'Capacidade', value: '≈ 5.200 mAh · 19,2 Wh' },
      { label: 'Carregador', value: 'TP4056 com proteção de descarga' },
      { label: 'Gerador', value: 'Mini gerador hidráulico F50-5V' },
      { label: 'Autonomia estimada', value: '≥ 18 meses sem fluxo' },
    ],
    bom: ['Mini Gerador Hidráulico F50-5V', 'Bateria Lítio 18650 (3.7V)'],
    accent: '#fbbf24',
    },
  {
    id: 'sensor',
    order: 2,
    name: 'Sensoriamento',
    role: 'Vazão e detecção de ar',
    summary: 'Sensor de fluxo YF-S201 e eletrodos de condutividade para identificar ar na rede.',
    description:
      'O YF-S201 mede a vazão por efeito Hall: cada giro da turbina gera um pulso (~450 pulsos por litro). Dois eletrodos de aço inox, com pull-down de 10 kΩ, medem a condutividade do fluido — quando o valor cai, há ar passando pelo registro.',
    badges: ['1–30 L/min', '~450 pulsos/L', 'Eletrodos inox'],
    specs: [
      { label: 'Sensor de vazão', value: 'YF-S201 · efeito Hall · 1/2"' },
      { label: 'Faixa', value: '1 a 30 L/min' },
      { label: 'Resolução', value: '2,2 mL por pulso (≈ 450 pulsos/L)' },
      { label: 'Detecção de ar', value: 'Condutividade em 2 eletrodos inox + 10 kΩ' },
      { label: 'Pressão máxima', value: '1,75 MPa' },
    ],
    bom: ['Sensor de Fluxo YF-S201 (1/2")', 'Parafusos de Aço Inox (eletrodos)', 'Resistência de 10k Ohms'],
    accent: '#22d3ee',
    },
  {
    id: 'body',
    order: 1,
    name: 'Corpo hidráulico',
    role: 'Câmara de medição e corte',
    summary: 'Tê de PVC 1/2" com a turbina em série e válvula de esfera motorizada.',
    description:
      'A base mecânica do protótipo: um Tê de PVC 1/2" abriga o rotor do YF-S201 e os eletrodos de ar. Na saída, a válvula de esfera motorizada permite cortar o fluxo remotamente pelo aplicativo.',
    badges: ['1/2" BSP', 'Válvula motorizada', '12 V'],
    specs: [
      { label: 'Conexões', value: 'Tê de PVC 1/2" (rosca BSP)' },
      { label: 'Elemento de medição', value: 'Turbina em série (YF-S201)' },
      { label: 'Atuador', value: 'Válvula de esfera motorizada 5–12 V' },
      { label: 'Acionamento', value: 'Ponte H L9110S + step-up MT3608' },
      { label: 'Vedação', value: 'O-ring + vedação de rosca' },
    ],
    bom: ['T de PVC (1/2")', 'Válvula de Esfera Motorizada (12V ou 5V)'],
    accent: '#a78bfa',
    },
];

export type BomRow = {
  category: string;
  item: string;
  role: string;
  qty: number;
  part: MeterPartId;
};

export const BOM: BomRow[] = [
  { category: 'Energia (Registro)', item: 'Mini Gerador Hidráulico F50-5V', role: 'Transformar o fluxo de água em 5 V para carregar as baterias.', qty: 1, part: 'power' },
  { category: 'Energia (Registro)', item: 'Módulo TP4056 com Proteção', role: 'Gerenciar a carga e descarga das baterias de lítio.', qty: 1, part: 'power' },
  { category: 'Energia (Registro)', item: 'Bateria Lítio 18650 (3.7 V)', role: 'Armazenar energia para períodos sem uso de água (2 em paralelo).', qty: 2, part: 'power' },
  { category: 'Cérebro (Registro)', item: 'ESP32 DevKit V1', role: 'Processar os pulsos, gerenciar o deep sleep e enviar dados.', qty: 1, part: 'pcb' },
  { category: 'Cérebro (Casa)', item: 'ESP32 DevKit V1', role: 'Receber os dados via rádio e enviar para o Wi-Fi/app.', qty: 1, part: 'pcb' },
  { category: 'Medição (Registro)', item: 'Sensor de Fluxo YF-S201 (1/2")', role: 'Medir com precisão a quantidade de litros por minuto.', qty: 1, part: 'sensor' },
  { category: 'Comunicação', item: 'Módulo LoRa SX1278 (433 MHz)', role: 'Enviar o sinal do registro para dentro de casa (longo alcance).', qty: 2, part: 'pcb' },
  { category: 'Proteção', item: 'Caixa Patola Estanque (IP65)', role: 'Proteger a eletrônica da umidade e chuva no registro.', qty: 1, part: 'cap' },
  { category: 'Conectividade', item: 'Antena 433 MHz com Pigtail', role: 'Aumentar o alcance do sinal LoRa através de muros.', qty: 2, part: 'cap' },
  { category: 'Anti ar', item: 'Parafusos de Aço Inox', role: 'Eletrodos de condutividade.', qty: 2, part: 'sensor' },
  { category: 'Anti ar', item: 'Resistência de 10 kΩ', role: 'Pull-down para o circuito de leitura.', qty: 1, part: 'sensor' },
  { category: 'Anti ar', item: 'T de PVC (1/2")', role: 'Suporte para os parafusos / câmara de medição.', qty: 1, part: 'body' },
  { category: 'Fechamento Remoto', item: 'Válvula de Esfera Motorizada (12 V ou 5 V)', role: 'Fechar/abrir o fluxo fisicamente via comando.', qty: 1, part: 'body' },
  { category: 'Fechamento Remoto', item: 'Módulo Driver Ponte H (L9110S)', role: 'Interface de potência entre o ESP32 e o motor da válvula.', qty: 1, part: 'body' },
  { category: 'Fechamento Remoto', item: 'Módulo Step-Up (MT3608)', role: 'Elevar os 3,7 V da bateria para os 12 V da válvula.', qty: 1, part: 'body' },
];

export type SpecGroupId = 'radio' | 'energia' | 'hidraulica' | 'firmware' | 'rede';

export const SPEC_GROUPS: {
  id: SpecGroupId;
  label: string;
  rows: { label: string; value: string; note?: string }[];
}[] = [
  {
    id: 'radio',
    label: 'Rádio',
    rows: [
      { label: 'Transceptor', value: 'Semtech SX1278', note: 'Módulo breakout 433 MHz' },
      { label: 'Frequência', value: '433 MHz (ISM)', note: 'Protótipo · ANATEL Res. 680' },
      { label: 'Modulação', value: 'LoRa CSS · SF7–SF12', note: 'BW 125 kHz' },
      { label: 'Potência de TX', value: '+20 dBm (100 mW)', note: 'Configurável até +20 dBm' },
      { label: 'Sensibilidade', value: '−148 dBm @ SF12', note: 'Depende de BW e SF' },
      { label: 'Alcance de projeto', value: '≈ 500 m urbano · ~2 km rural', note: 'Estimado, a validar em campo' },
      { label: 'Antena', value: 'Dipolo 433 MHz com pigtail', note: '2 unidades (nó + receptor)' },
      { label: 'Protocolo', value: 'LoRa P2P (protótipo)', note: 'LoRaWAN AU915 Classe A na v2' },
    ],
  },
  {
    id: 'energia',
    label: 'Energia',
    rows: [
      { label: 'Armazenamento', value: '2× Li-Ion 18650 · 3,7 V', note: '≈ 5.200 mAh em paralelo' },
      { label: 'Energia disponível', value: '≈ 19,2 Wh', note: 'Cálculo sobre 5.200 mAh × 3,7 V' },
      { label: 'Recarga', value: 'Mini gerador F50-5V + TP4056', note: 'Carrega apenas com fluxo de água' },
      { label: 'Consumo em deep sleep', value: '≈ 25 µA', note: 'Alvo de firmware' },
      { label: 'Consumo médio estimado', value: '≈ 1,2 mW', note: '1 uplink/min + leituras' },
      { label: 'Autonomia estimada', value: '≥ 18 meses sem fluxo', note: 'Estimativa; sem harvesting' },
      { label: 'Proteção', value: 'TP4056 + undershoot cutoff', note: 'Evita descarga profunda' },
    ],
  },
  {
    id: 'hidraulica',
    label: 'Hidráulica',
    rows: [
      { label: 'Conexão', value: '1/2" BSP', note: 'Tê de PVC com rosca' },
      { label: 'Faixa de vazão', value: '1–30 L/min', note: 'YF-S201' },
      { label: 'Resolução', value: '2,2 mL/pulso', note: '≈ 450 pulsos por litro' },
      { label: 'Precisão', value: '±2 % após calibração', note: 'Calibração de bancada' },
      { label: 'Pressão máxima', value: '1,75 MPa', note: 'Limite do sensor' },
      { label: 'Temperatura', value: '0–60 °C', note: 'Faixa de operação' },
      { label: 'Detecção de ar', value: 'Condutividade (2 eletrodos inox)', note: 'Pull-down 10 kΩ' },
      { label: 'Corte de fluxo', value: 'Válvula de esfera motorizada', note: '12 V · L9110S + MT3608' },
    ],
  },
  {
    id: 'firmware',
    label: 'Firmware',
    rows: [
      { label: 'Plataforma', value: 'ESP32 · Arduino Core', note: 'Dual-core 240 MHz' },
      { label: 'Leitura de vazão', value: 'Interrupção por pulso (GPIO)', note: 'Debounce por software' },
      { label: 'Detecção de ar', value: 'ADC + limiar de condutividade', note: 'Média móvel de 8 amostras' },
      { label: 'Ciclo de operação', value: 'Deep sleep + wake por timer', note: 'Uplink a cada 60 s (padrão)' },
      { label: 'Payload', value: '11 bytes', note: 'Ver mapa de bytes abaixo' },
      { label: 'Alertas', value: 'Ar · fluxo reverso · vazamento contínuo', note: 'Flags no byte 6' },
      { label: 'Atualização', value: 'OTA via Wi-Fi no receptor', note: 'Não implementado no nó' },
      { label: 'Segurança', value: 'AES-128 no backend', note: 'LoRaWAN na v2' },
    ],
  },
  {
    id: 'rede',
    label: 'Rede',
    rows: [
      { label: 'Enlace de campo', value: 'LoRa P2P 433 MHz', note: 'Nó → receptor ESP32' },
      { label: 'Backhaul', value: 'Wi-Fi 2,4 GHz', note: 'Receptor → roteador' },
      { label: 'Transporte', value: 'MQTT sobre TLS', note: 'Broker local' },
      { label: 'Servidor', value: 'Node-RED + InfluxDB', note: 'ChirpStack na versão LoRaWAN' },
      { label: 'API', value: 'REST + webhook', note: 'Consumo pelo app e dashboard' },
      { label: 'Retenção', value: '90 dias em alta resolução', note: 'Agregação horária depois' },
    ],
  },
];

export const PAYLOAD_BYTES = [
  { range: '0–1', name: 'flow_lpm', type: 'uint16 · /100', desc: 'Vazão instantânea em L/min com duas casas decimais.' },
  { range: '2–5', name: 'volume_l', type: 'uint32', desc: 'Volume acumulado em litros desde a instalação.' },
  { range: '6', name: 'flags', type: 'bitfield', desc: 'bit0 ar · bit1 fluxo reverso · bit2 vazamento · bit3 válvula fechada.' },
  { range: '7', name: 'battery', type: 'uint8 · %', desc: 'Percentual estimado por tensão da bateria.' },
  { range: '8–9', name: 'seq', type: 'uint16', desc: 'Contador de pacotes (detecta perda de uplinks).' },
  { range: '10', name: 'crc8', type: 'CRC-8/ATM', desc: 'Integridade do quadro.' },
];
