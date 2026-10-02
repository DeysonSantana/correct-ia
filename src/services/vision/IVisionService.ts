import { ExamAnswerMap } from '../../types/grading';
import { VisionProgressCallback } from '../../types/vision';
import { Exam } from '../../types/exam';

export interface IVisionService {
  /**
   * Processa imagem em formato base64/dataURL e extrai o mapa de alternativas assinaladas
   * com base nas especificações do exame (quantidade de questões, título, etc.).
   */
  extractAnswers(
    imageBase64: string, 
    exam: Exam, 
    onProgress?: VisionProgressCallback
  ): Promise<ExamAnswerMap>;
}
