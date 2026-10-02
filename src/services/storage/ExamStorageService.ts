import { Exam } from '../../types/exam';
import { OFFICIAL_ANSWER_KEY } from '../../constants/answerKey';

const EXAMS_STORAGE_KEY = 'correct_ia_exams_v1';
const ACTIVE_EXAM_ID_KEY = 'correct_ia_active_exam_id';

const DEFAULT_EXAM: Exam = {
  id: 'ds-avaliacao-final-40',
  title: 'Avaliação Final - Desenvolvimento de Sistemas',
  description: 'Gabarito Oficial integrado com 40 questões de múltipla escolha (A-E)',
  totalQuestions: 40,
  passingScorePercentage: 70,
  recoveryScorePercentage: 50,
  answerKey: OFFICIAL_ANSWER_KEY,
  createdAt: '2026-10-02T00:00:00.000Z',
  updatedAt: '2026-10-02T00:00:00.000Z',
  isDefault: true
};

export class ExamStorageService {
  /**
   * Retorna todos os exames cadastrados ou semeia o exame padrão na primeira execução.
   */
  public static getAllExams(): Exam[] {
    const raw = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_EXAM];
      this.saveAllExams(initial);
      this.setActiveExamId(DEFAULT_EXAM.id);
      return initial;
    }

    try {
      const parsed: Exam[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveAllExams([DEFAULT_EXAM]);
        return [DEFAULT_EXAM];
      }
      return parsed;
    } catch {
      this.saveAllExams([DEFAULT_EXAM]);
      return [DEFAULT_EXAM];
    }
  }

  /**
   * Retorna o exame atualmente ativo no corretor.
   */
  public static getActiveExam(): Exam {
    const exams = this.getAllExams();
    const activeId = localStorage.getItem(ACTIVE_EXAM_ID_KEY);

    if (activeId) {
      const found = exams.find(e => e.id === activeId);
      if (found) return found;
    }

    // Fallback para o primeiro
    const fallback = exams[0] || DEFAULT_EXAM;
    this.setActiveExamId(fallback.id);
    return fallback;
  }

  /**
   * Define qual exame está ativo para correção.
   */
  public static setActiveExamId(id: string): void {
    localStorage.setItem(ACTIVE_EXAM_ID_KEY, id);
  }

  /**
   * Salva ou atualiza um exame.
   */
  public static saveExam(examData: Exam): Exam {
    const exams = this.getAllExams();
    const now = new Date().toISOString();
    const existingIndex = exams.findIndex(e => e.id === examData.id);

    let savedExam: Exam;

    if (existingIndex >= 0) {
      savedExam = {
        ...examData,
        updatedAt: now
      };
      exams[existingIndex] = savedExam;
    } else {
      savedExam = {
        ...examData,
        id: examData.id || `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now
      };
      exams.push(savedExam);
    }

    this.saveAllExams(exams);
    return savedExam;
  }

  /**
   * Remove um exame pelo ID (se não for o único restante).
   */
  public static deleteExam(id: string): boolean {
    const exams = this.getAllExams();
    if (exams.length <= 1) {
      return false; // Não permitir excluir o último exame
    }

    const filtered = exams.filter(e => e.id !== id);
    this.saveAllExams(filtered);

    // Se o ativo foi o excluído, selecionar o primeiro
    if (localStorage.getItem(ACTIVE_EXAM_ID_KEY) === id) {
      this.setActiveExamId(filtered[0].id);
    }

    return true;
  }

  private static saveAllExams(exams: Exam[]): void {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
  }
}
