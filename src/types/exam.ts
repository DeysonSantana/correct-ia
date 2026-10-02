import { ExamAnswerMap } from './grading';

export interface Exam {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  passingScorePercentage: number;
  recoveryScorePercentage: number;
  answerKey: ExamAnswerMap;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export type ExamFormData = Omit<Exam, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};
