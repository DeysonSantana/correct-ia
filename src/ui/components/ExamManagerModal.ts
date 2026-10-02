import { Exam } from '../../types/exam';
import { AnswerOption, ExamAnswerMap } from '../../types/grading';
import { ExamStorageService } from '../../services/storage/ExamStorageService';

export class ExamManagerModal {
  private element: HTMLElement;
  private onExamChangedCallback: (activeExam: Exam) => void;
  private editingExam: Partial<Exam> | null = null;
  private tempAnswerKey: ExamAnswerMap = {};

  constructor(onExamChanged: (activeExam: Exam) => void) {
    this.onExamChangedCallback = onExamChanged;
    this.element = this.createElement();
    document.body.appendChild(this.element);
    this.bindEvents();
  }

  private createElement(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay hidden';
    overlay.id = 'examManagerModal';

    overlay.innerHTML = `
      <div class="modal-content" style="max-width: 680px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 style="font-weight: 700; font-size: 1.125rem;">📚 Gerenciador de Provas e Gabaritos</h3>
          <button id="btnCloseExamModal" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;">✕</button>
        </div>

        <!-- Abas: Lista de Provas / Editor -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
          <button id="tabListExams" class="btn btn-primary btn-sm">Minhas Provas</button>
          <button id="tabCreateExam" class="btn btn-outline btn-sm">➕ Criar / Editar Prova</button>
        </div>

        <!-- Seção 1: Lista de Provas Cadastradas -->
        <div id="viewListExams">
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">
            Selecione qual prova você deseja corrigir agora ou clique para editar/criar novos gabaritos.
          </p>
          <div id="examsListContainer"></div>
        </div>

        <!-- Seção 2: Formulário de Criação/Edição -->
        <div id="viewEditorExam" class="hidden">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 0;">
              <label class="form-label" for="inputExamTitle">Nome da Prova / Disciplina:</label>
              <input type="text" id="inputExamTitle" class="form-control" placeholder="Ex: Matemática - 2º Bimestre" />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="inputExamTotalQ">Qtd. de Questões (1 a 100):</label>
              <input type="number" id="inputExamTotalQ" class="form-control" min="1" max="100" value="20" />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="inputPassingScore">Nota de Corte / Aprovação (%):</label>
              <input type="number" id="inputPassingScore" class="form-control" min="0" max="100" value="70" />
            </div>
          </div>

          <!-- Preenchimento Rápido -->
          <div style="background: #f1f5f9; padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
            <label class="form-label" style="margin-bottom: 0.25rem;">⚡ Preenchimento Rápido de Respostas:</label>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.375rem;">
              Digite ou cole a sequência (Ex: <code>A B C D E</code> ou <code>ABCDE...</code> ou <code>1:A 2:B</code>):
            </p>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="inputQuickFill" class="form-control" placeholder="Ex: B B B C C B A B B B..." />
              <button id="btnApplyQuickFill" class="btn btn-outline btn-sm" style="white-space: nowrap;">Preencher</button>
            </div>
          </div>

          <label class="form-label">Gabarito Oficial (Clique nas alternativas):</label>
          <div class="key-editor-grid" id="keyEditorGrid"></div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem;">
            <button id="btnCancelEdit" class="btn btn-outline">Cancelar</button>
            <button id="btnSaveExam" class="btn btn-primary">Salvar Gabarito</button>
          </div>
        </div>
      </div>
    `;

    return overlay;
  }

  private bindEvents(): void {
    const btnClose = this.element.querySelector('#btnCloseExamModal');
    const tabList = this.element.querySelector('#tabListExams');
    const tabCreate = this.element.querySelector('#tabCreateExam');
    const viewList = this.element.querySelector<HTMLElement>('#viewListExams');
    const viewEditor = this.element.querySelector<HTMLElement>('#viewEditorExam');
    const inputTotalQ = this.element.querySelector<HTMLInputElement>('#inputExamTotalQ');
    const btnQuickFill = this.element.querySelector('#btnApplyQuickFill');
    const btnSave = this.element.querySelector('#btnSaveExam');
    const btnCancel = this.element.querySelector('#btnCancelEdit');

    btnClose?.addEventListener('click', () => this.hide());

    tabList?.addEventListener('click', () => {
      tabList.className = 'btn btn-primary btn-sm';
      if (tabCreate) tabCreate.className = 'btn btn-outline btn-sm';
      viewList?.classList.remove('hidden');
      viewEditor?.classList.add('hidden');
      this.renderExamsList();
    });

    tabCreate?.addEventListener('click', () => {
      this.startCreateNewExam();
    });

    btnCancel?.addEventListener('click', () => {
      tabList?.dispatchEvent(new Event('click'));
    });

    inputTotalQ?.addEventListener('change', () => {
      const count = Math.max(1, Math.min(100, parseInt(inputTotalQ.value, 10) || 10));
      inputTotalQ.value = String(count);
      this.renderKeyEditorGrid(count);
    });

    btnQuickFill?.addEventListener('click', () => {
      const input = this.element.querySelector<HTMLInputElement>('#inputQuickFill');
      if (input) this.applyQuickFill(input.value);
    });

    btnSave?.addEventListener('click', () => {
      this.saveCurrentExam();
    });
  }

  public show(): void {
    this.element.classList.remove('hidden');
    this.renderExamsList();
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }

  private renderExamsList(): void {
    const container = this.element.querySelector('#examsListContainer');
    if (!container) return;

    container.innerHTML = '';
    const exams = ExamStorageService.getAllExams();
    const active = ExamStorageService.getActiveExam();

    exams.forEach(exam => {
      const item = document.createElement('div');
      item.className = `exam-list-item ${exam.id === active.id ? 'active' : ''}`;

      item.innerHTML = `
        <div>
          <div style="font-weight: 700; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${exam.title}</span>
            ${exam.id === active.id ? '<span style="font-size: 0.6875rem; background: var(--primary); color: white; padding: 0.125rem 0.375rem; border-radius: 4px;">Ativa</span>' : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${exam.totalQuestions} questões &bull; Corte: ${exam.passingScorePercentage}%
          </div>
        </div>

        <div style="display: flex; gap: 0.375rem;">
          ${exam.id !== active.id ? `<button data-id="${exam.id}" class="btn btn-primary btn-sm btn-select-exam">Selecionar</button>` : ''}
          <button data-id="${exam.id}" class="btn btn-outline btn-sm btn-edit-exam">✏️ Editar</button>
          ${exams.length > 1 ? `<button data-id="${exam.id}" class="btn btn-outline btn-sm btn-del-exam" style="color: var(--danger);">🗑️</button>` : ''}
        </div>
      `;

      item.querySelector('.btn-select-exam')?.addEventListener('click', () => {
        ExamStorageService.setActiveExamId(exam.id);
        this.onExamChangedCallback(exam);
        this.renderExamsList();
        this.hide();
      });

      item.querySelector('.btn-edit-exam')?.addEventListener('click', () => {
        this.startEditExam(exam);
      });

      item.querySelector('.btn-del-exam')?.addEventListener('click', () => {
        if (confirm(`Deseja realmente excluir o gabarito "${exam.title}"?`)) {
          ExamStorageService.deleteExam(exam.id);
          const newActive = ExamStorageService.getActiveExam();
          this.onExamChangedCallback(newActive);
          this.renderExamsList();
        }
      });

      container.appendChild(item);
    });
  }

  public startCreateNewExam(): void {
    const tabList = this.element.querySelector('#tabListExams');
    const tabCreate = this.element.querySelector('#tabCreateExam');
    const viewList = this.element.querySelector<HTMLElement>('#viewListExams');
    const viewEditor = this.element.querySelector<HTMLElement>('#viewEditorExam');

    if (tabList) tabList.className = 'btn btn-outline btn-sm';
    if (tabCreate) tabCreate.className = 'btn btn-primary btn-sm';
    viewList?.classList.add('hidden');
    viewEditor?.classList.remove('hidden');

    this.editingExam = {
      title: '',
      totalQuestions: 20,
      passingScorePercentage: 70,
      recoveryScorePercentage: 50,
      answerKey: {}
    };
    this.tempAnswerKey = {};

    const inputTitle = this.element.querySelector<HTMLInputElement>('#inputExamTitle');
    const inputTotalQ = this.element.querySelector<HTMLInputElement>('#inputExamTotalQ');
    const inputScore = this.element.querySelector<HTMLInputElement>('#inputPassingScore');
    const inputQuick = this.element.querySelector<HTMLInputElement>('#inputQuickFill');

    if (inputTitle) inputTitle.value = '';
    if (inputTotalQ) inputTotalQ.value = '20';
    if (inputScore) inputScore.value = '70';
    if (inputQuick) inputQuick.value = '';

    this.renderKeyEditorGrid(20);
  }

  private startEditExam(exam: Exam): void {
    const tabList = this.element.querySelector('#tabListExams');
    const tabCreate = this.element.querySelector('#tabCreateExam');
    const viewList = this.element.querySelector<HTMLElement>('#viewListExams');
    const viewEditor = this.element.querySelector<HTMLElement>('#viewEditorExam');

    if (tabList) tabList.className = 'btn btn-outline btn-sm';
    if (tabCreate) tabCreate.className = 'btn btn-primary btn-sm';
    viewList?.classList.add('hidden');
    viewEditor?.classList.remove('hidden');

    this.editingExam = { ...exam };
    this.tempAnswerKey = { ...exam.answerKey };

    const inputTitle = this.element.querySelector<HTMLInputElement>('#inputExamTitle');
    const inputTotalQ = this.element.querySelector<HTMLInputElement>('#inputExamTotalQ');
    const inputScore = this.element.querySelector<HTMLInputElement>('#inputPassingScore');

    if (inputTitle) inputTitle.value = exam.title;
    if (inputTotalQ) inputTotalQ.value = String(exam.totalQuestions);
    if (inputScore) inputScore.value = String(exam.passingScorePercentage);

    this.renderKeyEditorGrid(exam.totalQuestions);
  }

  private renderKeyEditorGrid(totalQuestions: number): void {
    const grid = this.element.querySelector('#keyEditorGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const options: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

    for (let q = 1; q <= totalQuestions; q++) {
      const selectedOpt = this.tempAnswerKey[q] || 'A';
      this.tempAnswerKey[q] = selectedOpt;

      const row = document.createElement('div');
      row.className = 'key-row';
      row.dataset.question = String(q);

      const label = document.createElement('span');
      label.className = 'q-label';
      label.textContent = `Q${q}:`;
      row.appendChild(label);

      const btnGroup = document.createElement('div');
      btnGroup.style.display = 'flex';
      btnGroup.style.gap = '2px';

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-option ${selectedOpt === opt ? 'selected' : ''}`;
        btn.textContent = opt;

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.tempAnswerKey[q] = opt;
          btnGroup.querySelectorAll('.btn-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });

        btnGroup.appendChild(btn);
      });

      row.appendChild(btnGroup);
      grid.appendChild(row);
    }
  }

  private applyQuickFill(text: string): void {
    if (!text?.trim()) return;

    // Extrai letras A-E ignorando pontuações e números
    const cleanLetters = text.toUpperCase().match(/[A-E]/g);
    if (!cleanLetters || cleanLetters.length === 0) {
      alert("Nenhuma alternativa válida (A, B, C, D ou E) identificada no texto.");
      return;
    }

    const inputTotalQ = this.element.querySelector<HTMLInputElement>('#inputExamTotalQ');
    const totalQ = parseInt(inputTotalQ?.value || '20', 10);

    cleanLetters.forEach((letter, index) => {
      const q = index + 1;
      if (q <= totalQ) {
        this.tempAnswerKey[q] = letter as AnswerOption;
      }
    });

    this.renderKeyEditorGrid(totalQ);
  }

  private saveCurrentExam(): void {
    const inputTitle = this.element.querySelector<HTMLInputElement>('#inputExamTitle');
    const inputTotalQ = this.element.querySelector<HTMLInputElement>('#inputExamTotalQ');
    const inputScore = this.element.querySelector<HTMLInputElement>('#inputPassingScore');

    const title = inputTitle?.value?.trim();
    if (!title) {
      alert("Por favor, informe o título da prova.");
      return;
    }

    const totalQuestions = parseInt(inputTotalQ?.value || '20', 10);
    const passingScore = parseInt(inputScore?.value || '70', 10);

    const examToSave: Exam = {
      id: this.editingExam?.id || `exam-${Date.now()}`,
      title,
      totalQuestions,
      passingScorePercentage: passingScore,
      recoveryScorePercentage: 50,
      answerKey: { ...this.tempAnswerKey },
      createdAt: this.editingExam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = ExamStorageService.saveExam(examToSave);
    ExamStorageService.setActiveExamId(saved.id);
    this.onExamChangedCallback(saved);

    // Retorna para a lista de provas
    const tabList = this.element.querySelector('#tabListExams');
    tabList?.dispatchEvent(new Event('click'));
  }
}
