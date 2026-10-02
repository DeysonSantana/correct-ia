import { Exam } from '../../types/exam';
import { ExamStorageService } from '../../services/storage/ExamStorageService';

export interface NavbarCallbacks {
  onOpenSettings: () => void;
  onOpenExamManager: () => void;
  onSelectExam: (exam: Exam) => void;
}

export class Navbar {
  public static render(activeExam: Exam, callbacks: NavbarCallbacks): HTMLElement {
    const header = document.createElement('header');
    header.className = 'app-header';

    const exams = ExamStorageService.getAllExams();

    const optionsHtml = exams
      .map(
        e => `<option value="${e.id}" ${e.id === activeExam.id ? 'selected' : ''}>
          ${e.title} (${e.totalQuestions}Q)
        </option>`
      )
      .join('');

    header.innerHTML = `
      <div>
        <div class="badge-tag">
          <span class="dot"></span>
          <span>DevCraft OMR Engine v3.0</span>
        </div>
        <h1 class="title" id="navExamTitle">${activeExam.title}</h1>
        <p class="subtitle" id="navExamSubtitle">
          ${activeExam.totalQuestions} Questões &bull; Mínimo Aprovação: ${activeExam.passingScorePercentage}%
        </p>
      </div>

      <div class="exam-selector-container">
        <div>
          <label style="font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 2px;">
            Prova Selecionada:
          </label>
          <select id="selectActiveExam" class="exam-select">
            ${optionsHtml}
          </select>
        </div>

        <button id="btnOpenExamManager" class="btn btn-primary btn-sm" title="Gerenciar Gabaritos">
          📚 Gerenciar Provas
        </button>

        <button id="btnOpenSettings" class="btn btn-outline btn-sm" title="Configurar IA">
          ⚙️ Provedor IA
        </button>
      </div>
    `;

    const select = header.querySelector<HTMLSelectElement>('#selectActiveExam');
    select?.addEventListener('change', () => {
      const selectedId = select.value;
      ExamStorageService.setActiveExamId(selectedId);
      const newActive = ExamStorageService.getActiveExam();
      callbacks.onSelectExam(newActive);
    });

    header.querySelector('#btnOpenExamManager')?.addEventListener('click', callbacks.onOpenExamManager);
    header.querySelector('#btnOpenSettings')?.addEventListener('click', callbacks.onOpenSettings);

    return header;
  }

  public static updateHeader(headerEl: HTMLElement, activeExam: Exam): void {
    const titleEl = headerEl.querySelector('#navExamTitle');
    const subEl = headerEl.querySelector('#navExamSubtitle');
    const select = headerEl.querySelector<HTMLSelectElement>('#selectActiveExam');

    if (titleEl) titleEl.textContent = activeExam.title;
    if (subEl) {
      subEl.textContent = `${activeExam.totalQuestions} Questões • Mínimo Aprovação: ${activeExam.passingScorePercentage}%`;
    }

    if (select) {
      const exams = ExamStorageService.getAllExams();
      select.innerHTML = exams
        .map(
          e => `<option value="${e.id}" ${e.id === activeExam.id ? 'selected' : ''}>
            ${e.title} (${e.totalQuestions}Q)
          </option>`
        )
        .join('');
    }
  }
}
