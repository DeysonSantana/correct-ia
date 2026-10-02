import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { UploadSection } from './components/UploadSection';
import { SummaryCards } from './components/SummaryCards';
import { QuestionsGrid } from './components/QuestionsGrid';
import { StorageService } from '../services/storage/StorageService';
import { VisionServiceFactory } from '../services/vision/VisionServiceFactory';
import { GradingService } from '../services/grading/GradingService';
import { ExamAnswerMap, GradingSummary } from '../types/grading';
import { VisionConfig } from '../types/vision';

export class App {
  private rootElement: HTMLElement;
  private settingsModal!: SettingsModal;
  private uploadSection!: UploadSection;
  private summaryCards!: SummaryCards;
  private questionsGrid!: QuestionsGrid;

  private currentImageBase64: string | null = null;
  private currentSummary: GradingSummary | null = null;
  private currentStudentAnswers: ExamAnswerMap | null = null;
  private currentConfig: VisionConfig;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.currentConfig = StorageService.getVisionConfig();
    this.init();
  }

  private init(): void {
    const container = document.createElement('div');
    container.className = 'app-container';

    // 1. Navbar
    const nav = Navbar.render(() => this.settingsModal.show());
    container.appendChild(nav);

    // 2. Settings Modal
    this.settingsModal = new SettingsModal((updatedConfig) => {
      this.currentConfig = updatedConfig;
    });

    // 3. Upload & Capture Section
    this.uploadSection = new UploadSection({
      onImageSelected: (base64) => {
        this.currentImageBase64 = base64;
        this.summaryCards.hide();
        this.questionsGrid.hide();
      },
      onImageCleared: () => {
        this.currentImageBase64 = null;
        this.summaryCards.hide();
        this.questionsGrid.hide();
      },
      onStartGrading: () => this.handleStartGrading()
    });
    container.appendChild(this.uploadSection.getElement());

    // 4. Summary & Toolbar Section
    this.summaryCards = new SummaryCards({
      onFilterChange: (filter) => this.questionsGrid.applyFilter(filter),
      onExportJson: () => this.handleExportJson(),
      onPrint: () => window.print()
    });
    container.appendChild(this.summaryCards.getElement());

    // 5. Questions Grid Section
    this.questionsGrid = new QuestionsGrid();
    container.appendChild(this.questionsGrid.getElement());

    this.rootElement.appendChild(container);
  }

  private async handleStartGrading(): Promise<void> {
    if (!this.currentImageBase64) return;

    this.uploadSection.setProcessing(true, "Iniciando processamento...");
    this.summaryCards.hide();
    this.questionsGrid.hide();

    try {
      const visionService = VisionServiceFactory.create(this.currentConfig);
      
      const studentAnswers = await visionService.extractAnswers(
        this.currentImageBase64,
        (progressMessage) => {
          this.uploadSection.updateStatusMessage(progressMessage);
        }
      );

      this.currentStudentAnswers = studentAnswers;
      const summary = GradingService.gradeExam(studentAnswers);
      this.currentSummary = summary;

      this.summaryCards.update(summary);
      this.questionsGrid.renderQuestions(summary.questions);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao processar gabarito.";
      alert(message);
    } finally {
      this.uploadSection.setProcessing(false);
    }
  }

  private handleExportJson(): void {
    if (!this.currentSummary || !this.currentStudentAnswers) return;

    const report = GradingService.buildReport(this.currentSummary, this.currentStudentAnswers);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `avaliacao_gabarito_${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
