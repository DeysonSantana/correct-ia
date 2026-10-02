import { QuestionResult } from '../../types/grading';

export class QuestionsGrid {
  private element: HTMLElement;
  private currentQuestions: QuestionResult[] = [];
  private currentFilter: 'all' | 'wrong' | 'correct' = 'all';

  constructor() {
    this.element = this.createElement();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private createElement(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card hidden';
    card.id = 'gridContainer';

    card.innerHTML = `
      <h3 style="font-size: 0.9375rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>📋 Mapeamento Questão a Questão</span>
      </h3>
      <div class="questions-grid" id="gridInner"></div>
    `;

    return card;
  }

  public renderQuestions(questions: QuestionResult[]): void {
    this.currentQuestions = questions;
    this.element.classList.remove('hidden');
    this.applyFilter(this.currentFilter);
  }

  public applyFilter(filter: 'all' | 'wrong' | 'correct'): void {
    this.currentFilter = filter;
    const gridInner = this.element.querySelector('#gridInner');
    if (!gridInner) return;

    gridInner.innerHTML = '';

    const filtered = this.currentQuestions.filter(q => {
      if (filter === 'wrong') return !q.isCorrect;
      if (filter === 'correct') return q.isCorrect;
      return true;
    });

    if (filtered.length === 0) {
      gridInner.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          Nenhuma questão encontrada para este filtro.
        </div>
      `;
      return;
    }

    filtered.forEach(q => {
      const item = document.createElement('div');
      item.className = `question-card ${q.isCorrect ? 'correct' : 'incorrect'}`;
      item.innerHTML = `
        <div class="q-num">Q${q.questionNumber}</div>
        <div class="q-ans">${q.studentAnswer}</div>
        <div class="q-key">Gab: ${q.officialAnswer}</div>
      `;
      gridInner.appendChild(item);
    });
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
