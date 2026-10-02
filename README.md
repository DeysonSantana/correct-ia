# Corretor Automático de Gabaritos IA (Visão Computacional)

Aplicação Single Page Application (SPA) reativa e tipada para correção automática de gabaritos da **Avaliação Final Integrada - Desenvolvimento de Sistemas (40 Questões)**, pronta para hospedagem no **GitHub Pages**.

---

## 🏗️ Arquitetura e Estrutura de Pastas

O projeto segue padrões de **Clean Architecture** e princípios **SOLID**:

```
correct-ia/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD para deploy automático no GitHub Pages
├── src/
│   ├── constants/
│   │   └── answerKey.ts          # Gabarito oficial (40 questões) e regras de corte
│   ├── services/
│   │   ├── grading/
│   │   │   └── GradingService.ts # Lógica pura de conferência, percentual e status
│   │   ├── storage/
│   │   │   └── StorageService.ts # Persistência tipada no LocalStorage
│   │   └── vision/               # Strategy Pattern para Visão Computacional
│   │       ├── IVisionService.ts
│   │       ├── SimulatedVisionService.ts
│   │       ├── GeminiVisionService.ts
│   │       ├── OpenAIVisionService.ts
│   │       └── VisionServiceFactory.ts
│   ├── styles/
│   │   └── main.css              # Estilos modulares sem dependência de CDN externa
│   ├── types/
│   │   ├── grading.ts            # Interfaces de domínio (Questão, Resumo, Relatório)
│   │   └── vision.ts             # Interfaces do provedor de IA
│   ├── ui/
│   │   ├── components/
│   │   │   ├── Navbar.ts
│   │   │   ├── QuestionsGrid.ts
│   │   │   ├── SettingsModal.ts
│   │   │   ├── SummaryCards.ts
│   │   │   └── UploadSection.ts
│   │   └── App.ts                # Orquestrador reativo da aplicação
│   └── main.ts                   # Ponto de entrada
├── index.html                    # Documento raiz
├── package.json
├── tsconfig.json
└── vite.config.ts                # Configurado com base: './' para o GitHub Pages
```

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Compilar para produção (cria o diretório /dist)
npm run build

# 4. Pré-visualizar o build de produção localmente
npm run preview
```

---

## 🌐 Como Publicar no GitHub Pages

1. **Crie um repositório no GitHub** e envie o código:
   ```bash
   git init
   git add .
   git commit -m "feat: arquitetura modular do corretor de gabaritos"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Ative o GitHub Actions para o Pages**:
   - No GitHub, vá na aba **Settings** do repositório.
   - No menu lateral esquerdo, clique em **Pages**.
   - Na seção **Build and deployment > Source**, selecione: **GitHub Actions**.

3. O workflow definido em `.github/workflows/deploy.yml` fará o build do TypeScript e o deploy automaticamente a cada `git push`. A URL final ficará disponível em:
   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`
