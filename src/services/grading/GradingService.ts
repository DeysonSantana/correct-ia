import { 
  AnswerOption, 
  ExamAnswerMap, 
  GradingSummary, 
  QuestionResult, 
  ExamStatus, 
  ExamReport 
} from '../../types/grading';
import { Exam } from '../../types/exam';

export class GradingService {
  /**
   * Avalia as respostas do aluno em relação ao gabarito de um exame específico.
   */
  public static gradeExam(studentAnswers: ExamAnswerMap, exam: Exam): GradingSummary {
    const questions: QuestionResult[] = [];
    let correctCount = 0;
    const total = exam.totalQuestions;

    for (let q = 1; q <= total; q++) {
      const officialAnswer = exam.answerKey[q] || '-';
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

    const errorCount = total - correctCount;
    const accuracyPercentage = total > 0 ? Number(((correctCount / total) * 100).toFixed(1)) : 0;
    const status = this.resolveStatus(accuracyPercentage, exam);

    return {
      totalQuestions: total,
      correctCount,
      errorCount,
      accuracyPercentage,
      status,
      questions
    };
  }

  private static resolveStatus(percentage: number, exam: Exam): ExamStatus {
    if (percentage >= exam.passingScorePercentage) return 'APROVADO';
    if (percentage >= exam.recoveryScorePercentage) return 'RECUPERACAO';
    return 'REPROVADO';
  }

  /**
   * Constrói relatório formatado para exportação JSON.
   */
  public static buildReport(summary: GradingSummary, studentAnswers: ExamAnswerMap, exam: Exam): ExamReport {
    return {
      timestamp: new Date().toISOString(),
      examTitle: exam.title,
      totalQuestions: summary.totalQuestions,
      officialKey: exam.answerKey,
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
