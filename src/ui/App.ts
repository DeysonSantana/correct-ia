import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { ExamManagerModal } from './components/ExamManagerModal';
import { UploadSection } from './components/UploadSection';
import { SummaryCards } from './components/SummaryCards';
import { QuestionsGrid } from './components/QuestionsGrid';
import { StorageService } from '../services/storage/StorageService';
import { ExamStorageService } from '../services/storage/ExamStorageService';
import { VisionServiceFactory } from '../services/vision/VisionServiceFactory';
import { GradingService } from '../services/grading/GradingService';
import { ExamAnswerMap, GradingSummary } from '../types/grading';
import { VisionConfig } from '../types/vision';
import { Exam } from '../types/exam';

export class App {
  private rootElement: HTMLElement;
  private navElement!: HTMLElement;
  private settingsModal!: SettingsModal;
  private examManagerModal!: ExamManagerModal;
  private uploadSection!: UploadSection;
  private summaryCards!: SummaryCards;
  private questionsGrid!: QuestionsGrid;

  private currentImageBase64: string | null = null;
  private currentSummary: GradingSummary | null = null;
  private currentStudentAnswers: ExamAnswerMap | null = null;
  private currentConfig: VisionConfig;
  private activeExam: Exam;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.currentConfig = StorageService.getVisionConfig();
    this.activeExam = ExamStorageService.getActiveExam();
    this.init();
  }

  private init(): void {
    const container = document.createElement('div');
    container.className = 'app-container';

    // 1. Modais de Configuração e Provas
    this.settingsModal = new SettingsModal((updatedConfig) => {
      this.currentConfig = updatedConfig;
    });

    this.examManagerModal = new ExamManagerModal((updatedActiveExam) => {
      this.setActiveExam(updatedActiveExam);
    });

    // 2. Navbar Dinâmica
    this.navElement = Navbar.render(this.activeExam, {
      onOpenSettings: () => this.settingsModal.show(),
      onOpenExamManager: () => this.examManagerModal.show(),
      onSelectExam: (exam) => this.setActiveExam(exam)
    });
    container.appendChild(this.navElement);

    // 3. Área de Captura e Envio de Foto
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

    // 4. Cartões de Resumo e Barra de Ações
    this.summaryCards = new SummaryCards({
      onFilterChange: (filter) => this.questionsGrid.applyFilter(filter),
      onExportJson: () => this.handleExportJson(),
      onPrint: () => window.print()
    });
    container.appendChild(this.summaryCards.getElement());

    // 5. Grid de Questões
    this.questionsGrid = new QuestionsGrid();
    container.appendChild(this.questionsGrid.getElement());

    this.rootElement.appendChild(container);
  }

  private setActiveExam(exam: Exam): void {
    this.activeExam = exam;
    Navbar.updateHeader(this.navElement, exam);
    // Limpar correções anteriores para evitar confusão de dados
    this.summaryCards.hide();
    this.questionsGrid.hide();
    this.currentSummary = null;
    this.currentStudentAnswers = null;
  }

  private async handleStartGrading(): Promise<void> {
    if (!this.currentImageBase64) return;

    this.uploadSection.setProcessing(true, `Iniciando leitura para "${this.activeExam.title}"...`);
    this.summaryCards.hide();
    this.questionsGrid.hide();

    try {
      const visionService = VisionServiceFactory.create(this.currentConfig);
      
      const studentAnswers = await visionService.extractAnswers(
        this.currentImageBase64,
        this.activeExam,
        (progressMessage) => {
          this.uploadSection.updateStatusMessage(progressMessage);
        }
      );

      this.currentStudentAnswers = studentAnswers;
      const summary = GradingService.gradeExam(studentAnswers, this.activeExam);
      this.currentSummary = summary;

      this.summaryCards.update(summary, this.activeExam);
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

    const report = GradingService.buildReport(
      this.currentSummary, 
      this.currentStudentAnswers, 
      this.activeExam
    );
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `resultado_${this.activeExam.id}_${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
