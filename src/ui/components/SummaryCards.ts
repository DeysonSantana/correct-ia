import { GradingSummary } from '../../types/grading';
import { Exam } from '../../types/exam';

export interface SummaryToolbarCallbacks {
  onFilterChange: (filter: 'all' | 'wrong' | 'correct') => void;
  onExportJson: () => void;
  onPrint: () => void;
}

export class SummaryCards {
  private element: HTMLElement;
  private callbacks: SummaryToolbarCallbacks;

  constructor(callbacks: SummaryToolbarCallbacks) {
    this.callbacks = callbacks;
    this.element = this.createElement();
    this.bindEvents();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'hidden';
    container.id = 'summaryContainer';

    container.innerHTML = `
      <div class="summary-grid">
        <!-- Acertos Card -->
        <div class="metric-card">
          <div class="metric-title">Acertos / Total</div>
          <div class="metric-value">
            <span id="metricScore">0</span>
            <span style="font-size: 1.125rem; font-weight: 600; color: var(--text-muted);" id="metricTotalQ">/ 40</span>
          </div>
          <div class="metric-sub" id="metricErrors">0 erros</div>
        </div>

        <!-- Aproveitamento Card -->
        <div class="metric-card">
          <div class="metric-title">Aproveitamento</div>
          <div class="metric-value" style="color: var(--success);" id="metricPercent">0%</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="metricProgress" style="width: 0%;"></div>
          </div>
        </div>

        <!-- Situação Final Card -->
        <div class="metric-card">
          <div class="metric-title">Situação Final</div>
          <div>
            <span class="status-pill status-approved" id="metricStatusBadge">-</span>
          </div>
          <div class="metric-sub" id="metricPassingRule">Nota de corte: 70%</div>
        </div>
      </div>

      <!-- Toolbar de Ações & Filtros -->
      <div class="toolbar">
        <div class="filter-group">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Filtrar:</span>
          <button id="btnFilterAll" class="btn btn-primary btn-sm">Todas</button>
          <button id="btnFilterWrong" class="btn btn-outline btn-sm">Incorretas</button>
          <button id="btnFilterCorrect" class="btn btn-outline btn-sm">Corretas</button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button id="btnExportJsonAction" class="btn btn-outline btn-sm">📥 Exportar JSON</button>
          <button id="btnPrintAction" class="btn btn-outline btn-sm">🖨️ Imprimir</button>
        </div>
      </div>
    `;

    return container;
  }

  private bindEvents(): void {
    const btnAll = this.element.querySelector('#btnFilterAll');
    const btnWrong = this.element.querySelector('#btnFilterWrong');
    const btnCorrect = this.element.querySelector('#btnFilterCorrect');
    const btnExport = this.element.querySelector('#btnExportJsonAction');
    const btnPrint = this.element.querySelector('#btnPrintAction');

    const setActiveButton = (activeBtn: Element | null) => {
      [btnAll, btnWrong, btnCorrect].forEach(btn => {
        if (btn) {
          btn.className = btn === activeBtn ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
        }
      });
    };

    btnAll?.addEventListener('click', () => {
      setActiveButton(btnAll);
      this.callbacks.onFilterChange('all');
    });

    btnWrong?.addEventListener('click', () => {
      setActiveButton(btnWrong);
      this.callbacks.onFilterChange('wrong');
    });

    btnCorrect?.addEventListener('click', () => {
      setActiveButton(btnCorrect);
      this.callbacks.onFilterChange('correct');
    });

    btnExport?.addEventListener('click', () => this.callbacks.onExportJson());
    btnPrint?.addEventListener('click', () => this.callbacks.onPrint());
  }

  public update(summary: GradingSummary, exam: Exam): void {
    const scoreEl = this.element.querySelector('#metricScore');
    const totalQEl = this.element.querySelector('#metricTotalQ');
    const errorsEl = this.element.querySelector('#metricErrors');
    const percentEl = this.element.querySelector('#metricPercent');
    const progressEl = this.element.querySelector<HTMLElement>('#metricProgress');
    const badgeEl = this.element.querySelector<HTMLElement>('#metricStatusBadge');
    const ruleEl = this.element.querySelector('#metricPassingRule');
    const btnAll = this.element.querySelector('#btnFilterAll');

    if (scoreEl) scoreEl.textContent = String(summary.correctCount);
    if (totalQEl) totalQEl.textContent = `/ ${summary.totalQuestions}`;
    if (errorsEl) {
      errorsEl.textContent = `${summary.errorCount} ${summary.errorCount === 1 ? 'erro' : 'erros'}`;
    }
    if (percentEl) percentEl.textContent = `${summary.accuracyPercentage}%`;
    if (progressEl) progressEl.style.width = `${summary.accuracyPercentage}%`;
    if (ruleEl) ruleEl.textContent = `Nota de corte: ${exam.passingScorePercentage}%`;
    if (btnAll) btnAll.textContent = `Todas (${summary.totalQuestions})`;

    if (badgeEl) {
      badgeEl.className = 'status-pill';
      if (summary.status === 'APROVADO') {
        badgeEl.classList.add('status-approved');
        badgeEl.textContent = '🎉 Aprovado';
      } else if (summary.status === 'RECUPERACAO') {
        badgeEl.classList.add('status-recovery');
        badgeEl.textContent = '⚠️ Em Recuperação';
      } else {
        badgeEl.classList.add('status-failed');
        badgeEl.textContent = '❌ Reprovado';
      }
    }

    this.element.classList.remove('hidden');
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
