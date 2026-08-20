# W-Guard 🛡️ — Ecossistema IoT de Monitoramento Hídrico Autossustentável

[![Vite](https://img.shields.io/badge/Vite-B736FF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](LICENSE)

O **W-Guard** é uma solução integrada de Internet das Coisas (IoT) focada em eficiência hídrica residencial, defesa do consumidor e infraestrutura de cidades inteligentes (Smart Cities). O ecossistema compreende um hardware medidor instalado no registro doméstico que protege contra a tarifação de ar nas tubulações e uma rede de sensores urbanos de prevenção contra alagamentos.

---

## ⚡ Diferenciais do Ecossistema

1. **🛡️ Detecção e Bloqueio Lógico de Ar**: Filtra a assinatura física de passagem de ar comprimido na rede hidráulica doméstica, reduzindo em até 70% o erro de cobrança indevida na fatura.
2. **🔋 Autossustentabilidade Energética (Energy Harvesting)**: O hardware é alimentado pela energia cinética do fluxo hídrico por meio de um minigerador hidráulico integrado, eliminando a dependência de baterias externas ou tomadas.
3. **🚰 Fechamento Remoto (Corte)**: Permite o bloqueio preventivo ou emergencial da entrada de água por meio de uma válvula motorizada operável à distância via aplicativo.
4. **🌧️ Prevenção Preventiva de Enchentes**: Módulos instalados em bueiros urbanos críticos utilizam sensores ultrassônicos para detectar obstruções e alertar os órgãos municipais de forma georreferenciada.

---

## 🏗️ Arquitetura e Componentes

A estrutura da solução divide-se em três camadas principais:

### 1. Hardware de Campo
* **Smart Hidrômetro**: Microcontrolador embarcado calibrado para detecção de ar e consumo com acionamento de corte físico.
* **Módulo de Monitoramento Urbano**: Sensores blindados IP68 de nível de água/obstrução instalados na base interna dos bueiros pluviais.
* **Minigerador Hidráulico**: Mecanismo de colheita energética de fluxo.

### 2. Comunicação e Nuvem
* **Gateway IoT**: Ponto de recepção hídrico operando via Wi-Fi (residencial) ou rádio LoRaWAN (urbano), cobrindo distâncias de até 500 metros com barreiras físicas.
* **Servidor Central**: Banco de dados cronológico para consolidação de telemetrias e despacho de alertas instantâneos.

### 3. Interfaces (Software)
* **Aplicativo Mobile**: Interface pessoal do usuário doméstico para controle de gastos, alertas de vazamento/ar e comando remoto da válvula.
* **Painel da Gestão Pública**: Mapa de riscos urbano georreferenciado com telemetrias dos bueiros para tomadas de decisão ágeis pela Defesa Civil e Secretarias de Infraestrutura.

---

## 📋 Resumo do Termo de Abertura do Projeto (TAP)

* **Gerente do Projeto**: João Vitor de Jesus Souza
* **Aprovador Acadêmico**: Prof. André Saraiva
* **Data da Versão**: 05/2026 (Versão 1.0)
* **Prazo Estimado**: 1 ano e 6 meses
* **Meta Principal**: Reduzir em 70% o erro de leitura de ar na tubulação doméstica, validado em 5 residências reais em bairros distintos.
* **Estimativa Financeira Total**: R$ 1.188.600,00  
  *(Mão de obra: R$1.152.000,00 | Equipamentos: R$600,00 por produto | Hospedagem: R$36.000,00)*

---

## 👥 Equipe de Desenvolvimento e Engenharia

A equipe do projeto é composta por estudantes de Engenharia de Software focados em competências práticas e negócios:

* 👤 **João Vitor** (Líder Técnico / Desenvolvedor)  
  `+3 anos em desenvolvimento de software | Gestão de equipes Dev | Apps escaláveis | Arquitetura de software | Banco de Dados`
* 👤 **André Nascimento** (Empreendedor de Negócios)  
  `Empreendedorismo estratégico | Visão de mercado e soluções escaláveis | Alinhamento cliente-técnico`
* 👤 **Guilherme Paranhos** (Sensoriamento Remoto)  
  `Geoprocessamento e gestão de dados | Análise de rede de abastecimento | Documentação, testes e validação de sistema | Eficiência hídrica`
* 👤 **Joseph Carvalho** (Marketing Digital)  
  `Estratégias de marketing digital | Tráfego pago e posicionamento orgânico | Otimização de investimentos | Jornada do cliente`
* 👤 **Rafael Santos** (Analista de Suporte & Analista de QA)  
  `Análise de Suporte e QA | Blindagem da experiência do cliente | Produto livre de falhas | Satisfação e retenção do usuário`
* 👤 **Rony** (Técnico Instalação)  
  `Instalação e manutenção de equipamentos | Experiência em obras residenciais e prediais | Garantia de funcionamento e segurança`
* 👤 **Leonardo Lima** (Cyber Security / Projetista 3D)  
  `+25 anos em TI e segurança da informação | Administração de redes (Linux/Windows) e SOC | Eletrônica aplicada e DPOAs | Modelagem e impressão 3D`

---

## 💻 Instalação e Execução Local

### Pré-requisitos
* Node.js instalado (v18 ou superior recomendado).
* Gerenciador de pacotes npm.

### Executar a Landing Page e Simulador
1. Clone o repositório em sua máquina local:
   ```bash
   git clone https://github.com/Jvjesus89/W-Guard.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd W-Guard
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o link gerado no terminal (geralmente [http://localhost:5173](http://localhost:5173)) para acessar a landing page e interagir com o painel de simulação.

---

## 🛠️ Tecnologias Utilizadas na Landing Page
- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empacotador**: [Vite](https://vite.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)

- https://jvjesus89.github.io/W-Guard/
