export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E' | '-';

export type ExamAnswerMap = Record<number, AnswerOption>;

export type ExamStatus = 'APROVADO' | 'RECUPERACAO' | 'REPROVADO';

export interface QuestionResult {
  questionNumber: number;
  studentAnswer: AnswerOption;
  officialAnswer: AnswerOption;
  isCorrect: boolean;
}

export interface GradingSummary {
  totalQuestions: number;
  correctCount: number;
  errorCount: number;
  accuracyPercentage: number;
  status: ExamStatus;
  questions: QuestionResult[];
}

export interface ExamReport {
  timestamp: string;
  examTitle: string;
  totalQuestions: number;
  officialKey: ExamAnswerMap;
  studentAnswers: ExamAnswerMap;
  summary: {
    correctCount: number;
    errorCount: number;
    accuracyPercentage: number;
    status: ExamStatus;
  };
}
