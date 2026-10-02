import { ExamAnswerMap } from '../../types/grading';
import { VisionProgressCallback } from '../../types/vision';

export interface IVisionService {
  /**
   * Processa imagem em formato base64/dataURL e extrai o mapa de alternativas assinaladas.
   */
  extractAnswers(imageBase64: string, onProgress?: VisionProgressCallback): Promise<ExamAnswerMap>;
}
