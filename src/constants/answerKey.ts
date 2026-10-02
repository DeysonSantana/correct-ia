import { ExamAnswerMap } from '../types/grading';

/**
 * Gabarito Oficial da Avaliação Final Integrada - Desenvolvimento de Sistemas (40 Questões).
 */
export const OFFICIAL_ANSWER_KEY: Readonly<ExamAnswerMap> = Object.freeze({
  1: 'B', 2: 'B', 3: 'B', 4: 'C', 5: 'C',
  6: 'B', 7: 'A', 8: 'B', 9: 'B', 10: 'B',
  11: 'B', 12: 'C', 13: 'C', 14: 'A', 15: 'B',
  16: 'C', 17: 'C', 18: 'B', 19: 'B', 20: 'B',
  21: 'B', 22: 'A', 23: 'B', 24: 'D', 25: 'B',
  26: 'C', 27: 'D', 28: 'C', 29: 'C', 30: 'B',
  31: 'A', 32: 'C', 33: 'B', 34: 'B', 35: 'A',
  36: 'D', 37: 'B', 38: 'D', 39: 'C', 40: 'D'
});

export const TOTAL_EXAM_QUESTIONS = 40;
export const PASSING_PERCENTAGE_THRESHOLD = 70;
export const RECOVERY_PERCENTAGE_THRESHOLD = 50;
