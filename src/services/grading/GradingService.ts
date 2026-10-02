import { 
  AnswerOption, 
  ExamAnswerMap, 
  GradingSummary, 
  QuestionResult, 
  ExamStatus, 
  ExamReport 
} from '../../types/grading';
import { 
  OFFICIAL_ANSWER_KEY, 
  TOTAL_EXAM_QUESTIONS, 
  PASSING_PERCENTAGE_THRESHOLD, 
  RECOVERY_PERCENTAGE_THRESHOLD 
} from '../../constants/answerKey';

export class GradingService {
  /**
   * Avalia as respostas do aluno em relação ao gabarito oficial.
   */
  public static gradeExam(studentAnswers: ExamAnswerMap): GradingSummary {
    const questions: QuestionResult[] = [];
    let correctCount = 0;

    for (let q = 1; q <= TOTAL_EXAM_QUESTIONS; q++) {
      const officialAnswer = OFFICIAL_ANSWER_KEY[q] || '-';
      const rawStudent = (studentAnswers[q] || '-').trim().toUpperCase() as AnswerOption;
      
      const isCorrect = rawStudent !== '-' && rawStudent === officialAnswer;
      if (isCorrect) correctCount++;

      questions.push({
        questionNumber: q,
        studentAnswer: rawStudent,
        officialAnswer,
        isCorrect
      });
    }

    const errorCount = TOTAL_EXAM_QUESTIONS - correctCount;
    const accuracyPercentage = Number(((correctCount / TOTAL_EXAM_QUESTIONS) * 100).toFixed(1));
    const status = this.resolveStatus(accuracyPercentage);

    return {
      totalQuestions: TOTAL_EXAM_QUESTIONS,
      correctCount,
      errorCount,
      accuracyPercentage,
      status,
      questions
    };
  }

  private static resolveStatus(percentage: number): ExamStatus {
    if (percentage >= PASSING_PERCENTAGE_THRESHOLD) return 'APROVADO';
    if (percentage >= RECOVERY_PERCENTAGE_THRESHOLD) return 'RECUPERACAO';
    return 'REPROVADO';
  }

  /**
   * Constrói relatório formatado para exportação JSON.
   */
  public static buildReport(summary: GradingSummary, studentAnswers: ExamAnswerMap): ExamReport {
    return {
      timestamp: new Date().toISOString(),
      examTitle: "Avaliação Final Integrada - Desenvolvimento de Sistemas",
      totalQuestions: summary.totalQuestions,
      officialKey: OFFICIAL_ANSWER_KEY,
      studentAnswers,
      summary: {
        correctCount: summary.correctCount,
        errorCount: summary.errorCount,
        accuracyPercentage: summary.accuracyPercentage,
        status: summary.status
      }
    };
  }
}
