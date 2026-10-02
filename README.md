# 📝 Corretor Automático de Gabaritos IA (Visão Computacional & OMR)

Uma aplicação web moderna (**Single Page Application**) de alta performance desenvolvida em **TypeScript** e **Vite**, projetada para automatizar a leitura e correção óptica de folhas de respostas (gabaritos) a partir de fotos tiradas por smartphone ou enviadas pelo computador. 

A aplicação está configurada com **CI/CD via GitHub Actions** e pronta para hospedagem estática no **GitHub Pages**.

---

## 🎯 Sumário

1. [Funcionalidades Principais](#-funcionalidades-principais)
2. [Passo a Passo: Como Usar a Aplicação](#-passo-a-passo-como-usar-a-aplicação)
   - [1. Selecionando ou Criando um Gabarito de Prova](#1-selecionando-ou-criando-um-gabarito-de-prova)
   - [2. Configurando o Provedor de Visão Computacional](#2-configurando-o-provedor-de-visão-computacional)
   - [3. Capturando ou Enviando a Imagem](#3-capturando-ou-enviando-a-imagem)
   - [4. Visualizando e Filtrando os Resultados](#4-visualizando-e-filtrando-os-resultados)
   - [5. Exportando e Imprimindo o Relatório](#5-exportando-e-imprimindo-o-relatório)
3. [Engenharia e Arquitetura do Software](#-engenharia-e-arquitetura-do-software)
4. [Executando Localmente (Ambiente de Desenvolvimento)](#-executando-localmente-ambiente-de-desenvolvimento)
5. [Deploy e Atualização no GitHub Pages](#-deploy-e-atualização-no-github-pages)
6. [Segurança e Privacidade](#-segurança-e-privacidade)

---

## ✨ Funcionalidades Principais

### 1. 📚 Gerenciador Dinâmico de Múltiplos Gabaritos
- **Suporte a qualquer disciplina ou avaliação:** Não fique restrito a uma única prova. Crie quantas avaliações desejar (Ex: *Matemática - 1º Bimestre*, *Simulado ENEM*, *História*, etc.).
- **Tamanho flexível de questões:** Configure provas de **1 a 100 questões**.
- **Nota de corte personalizável:** Ajuste o percentual mínimo para aprovação (ex: 60%, 70%) e recuperação para cada prova individualmente.
- **⚡ Preenchimento Rápido com IA/Texto:** Cole sequências inteiras de respostas em formato livre (Ex: `A B C D E A B C...` ou `ABCDE...` ou `1:A 2:B`) e o sistema preenche todos os botões automaticamente em um clique.
- **Grade Interativa:** Ajuste facilmente qualquer alternativa clicando diretamente nos botões `[A] [B] [C] [D] [E]` da questão desejada.

### 2. 👁️ Mecanismo Híbrido de Visão Computacional
- **⚡ Modo Simulação Rápida (Offline / Demonstração):** Permite testar o fluxo de correção imediatamente sem gastar tokens ou depender de conexão de internet.
- **✨ Google Gemini Flash Vision (Recomendado):** Utiliza os modelos multimodais de baixa latência do Google AI Studio para analisar folhas manuscritas ou escaneadas com alta precisão.
- **🤖 OpenAI GPT-4o Vision:** Suporte direto à API da OpenAI via saídas estruturadas em JSON.

### 3. 📊 Dashboard de Desempenho em Tempo Real
- **Métricas Instantâneas:** Exibição do total de **Acertos / Total de Questões**, contagem de erros e taxa percentual de aproveitamento com barra de progresso.
- **Status da Avaliação:** Classificação automática em **Aprovado**, **Em Recuperação** ou **Reprovado** calculada dinamicamente conforme a nota de corte configurada para a prova.
- **Mapeamento Questão a Questão:** Grade com cards visuais identificando em verde os acertos e em vermelho os erros, mostrando tanto a alternativa marcada pelo aluno quanto o gabarito oficial esperado.
- **Filtros Rápidos:** Botões para alternar instantaneamente entre a visualização de *Todas as Questões*, *Apenas Incorretas* ou *Apenas Corretas*.

### 4. 📄 Exportação e Impressão de Relatórios
- **Exportação JSON:** Download de arquivo JSON completo contendo metadados da prova, carimbo de data/hora, gabarito oficial e todas as respostas detectadas.
- **Layout de Impressão:** Botão de impressão com folha estilizada para papel A4, ocultando controles de interface e exibindo apenas os dados do aluno e o mapeamento das respostas.

---

## 🚀 Passo a Passo: Como Usar a Aplicação

### 1. Selecionando ou Criando um Gabarito de Prova

1. No topo da página, localize o seletor **"Prova Selecionada"**.
2. Para alternar entre as provas já cadastradas, basta escolher uma opção no menu suspenso.
3. Para criar um novo gabarito ou editar um existente:
   - Clique no botão **"📚 Gerenciar Provas"**.
   - Na aba **"Minhas Provas"**, você pode ver a lista de avaliações, excluir ou clicar em **"✏️ Editar"**.
   - Para criar uma nova, clique na aba **"➕ Criar / Editar Prova"**.
   - Preencha o **Nome da Prova**, a **Qtd. de Questões** (ex: 20) e a **Nota de Corte** (ex: 70%).
   - No campo **Preenchimento Rápido**, digite ou cole as letras correspondentes (ex: `A B C D E...`) e clique em **"Preencher"**.
   - Se desejar, ajuste manualmente qualquer alternativa clicando nas letras de cada questão.
   - Clique em **"Salvar Gabarito"**. A nova prova já ficará selecionada como ativa!

---

### 2. Configurando o Provedor de Visão Computacional

1. Clique no botão **"⚙️ Provedor IA"** no cabeçalho superior.
2. Escolha o modo de processamento desejado:
   - **Simulação Rápida:** Não necessita de chave. Ideal para testar a interface.
   - **Google Gemini 1.5 Flash:** Cole sua chave gratuita obtida no [Google AI Studio](https://aistudio.google.com/).
   - **OpenAI GPT-4o Vision:** Cole sua chave iniciada com `sk-...` gerada na OpenAI.
3. Clique em **"Salvar Configuração"**.

---

### 3. Capturando ou Enviando a Imagem

1. Clique no botão **"📷 Tirar Foto / Selecionar Arquivo"**:
   - **No celular:** A câmera traseira será acionada automaticamente para enquadrar a folha de respostas.
   - **No computador:** Uma janela se abrirá para escolher uma foto (JPG, PNG ou WEBP).
2. Uma pré-visualização da folha selecionada aparecerá na tela.
3. Certifique-se de que a folha esteja bem iluminada e alinhada.
4. Clique no botão verde **"⚡ Iniciar Correção"**.

---

### 4. Visualizando e Filtrando os Resultados

1. Durante o processamento, uma barra de progresso informará o andamento da leitura óptica.
2. Ao término, os painéis de resultados surgirão instantaneamente:
   - **Painel Superior:** Total de acertos, taxa percentual e status de aprovação.
   - **Barra de Filtros:** Clique em **"Incorretas"** para inspecionar rapidamente apenas as questões que o aluno errou.
   - **Grid de Questões:** Cada card exibe o número da questão, a opção marcada pelo aluno e a resposta correta do gabarito.

---

### 5. Exportando e Imprimindo o Relatório

- **Salvar arquivo de dados:** Clique em **"📥 Exportar JSON"** para baixar o histórico estruturado da correção.
- **Imprimir ou salvar em PDF:** Clique em **"🖨️ Imprimir"**. A visualização abrirá a caixa de impressão do navegador já com formatação limpa e pronta para arquivo escolar.

---

## 🛠️ Engenharia e Arquitetura do Software

A base de código segue rigorosamente o padrão **SOLID** e separação de responsabilidades:

```text
correct-ia/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Pipeline CI/CD GitHub Actions para o Pages
├── src/
│   ├── constants/
│   │   └── answerKey.ts            # Gabarito oficial inicial de Desenvolvimento de Sistemas
│   ├── services/
│   │   ├── grading/
│   │   │   └── GradingService.ts   # Função pura de cruzamento e cálculo de pontuação
│   │   ├── storage/
│   │   │   ├── StorageService.ts       # Armazenamento tipado de preferências e chaves
│   │   │   └── ExamStorageService.ts   # CRUD de múltiplos gabaritos no LocalStorage
│   │   └── vision/                 # Strategy Pattern para visão computacional
│   │       ├── IVisionService.ts
│   │       ├── SimulatedVisionService.ts
│   │       ├── GeminiVisionService.ts
│   │       ├── OpenAIVisionService.ts
│   │       └── VisionServiceFactory.ts
│   ├── styles/
│   │   └── main.css                # Estilização CSS modular responsiva sem dependência de CDN
│   ├── types/
│   │   ├── exam.ts                 # Interfaces de Prova/Gabarito
│   │   ├── grading.ts              # Tipagens de correção, respostas e relatórios
│   │   └── vision.ts               # Tipagens de provedores e callbacks de progresso
│   ├── ui/
│   │   ├── components/
│   │   │   ├── ExamManagerModal.ts # Modal completo de criação e edição de provas
│   │   │   ├── Navbar.ts           # Topbar com seletor e atalhos rápidos
│   │   │   ├── QuestionsGrid.ts    # Grade com os cards de 1 a N questões
│   │   │   ├── SettingsModal.ts    # Modal de configuração de chaves de API
│   │   │   ├── SummaryCards.ts     # Cards de score, aproveitamento e barra de ações
│   │   │   └── UploadSection.ts    # Área de captura de câmera e upload
│   │   └── App.ts                  # Orquestrador reativo principal
│   └── main.ts                     # Ponto de entrada
├── index.html                      # Documento raiz da SPA
├── package.json
├── tsconfig.json                   # Tipagem estrita TypeScript
└── vite.config.ts                  # Configuração do Vite com base relativa (./)
```

---

## 💻 Executando Localmente (Ambiente de Desenvolvimento)

Requisitos: **Node.js 18+** instalado.

```bash
# 1. Clonar o repositório
git clone https://github.com/DeysonSantana/correct-ia.git

# 2. Entrar na pasta do projeto
cd correct-ia

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor local com Hot-Reload
npm run dev

# 5. Compilar o projeto para produção (gera a pasta dist/)
npm run build

# 6. Testar o build de produção localmente
npm run preview
```

---

## 🌐 Deploy e Atualização no GitHub Pages

O projeto já possui integração contínua nativa configurada em `.github/workflows/deploy.yml`.

### Para enviar melhorias e atualizar o site em produção:

```bash
git add .
git commit -m "feat: descrição da melhoria realizada"
git push origin main
```

O GitHub Actions compilará os arquivos TypeScript e atualizará o site automaticamente em menos de 1 minuto em:
👉 **`https://deysonsantana.github.io/correct-ia/`**

---

## 🔒 Segurança e Privacidade

- **Arquitetura 100% Client-Side:** Todas as imagens, chaves de API e gabaritos cadastrados são processados e armazenados **exclusivamente no navegador do usuário** (`localStorage`).
- **Nenhuma chave exposta no código-fonte:** Suas credenciais do Google AI Studio ou OpenAI jamais são enviadas para servidores intermediários ou comitadas no repositório do GitHub.
- **Conexão Segura:** O GitHub Pages opera com HTTPS forçado de ponta a ponta.
