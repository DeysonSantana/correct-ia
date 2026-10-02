import { IVisionService } from './IVisionService';
import { AnswerOption, ExamAnswerMap } from '../../types/grading';
import { VisionProgressCallback } from '../../types/vision';
import { Exam } from '../../types/exam';

export class SimulatedVisionService implements IVisionService {
  public async extractAnswers(
    _imageBase64: string,
    exam: Exam,
    onProgress?: VisionProgressCallback
  ): Promise<ExamAnswerMap> {
    onProgress?.(`Inicializando simulação para "${exam.title}" (${exam.totalQuestions} questões)...`);
    await this.delay(500);

    onProgress?.("Detectando contornos e alinhamento da folha...");
    await this.delay(500);

    onProgress?.(`Mapeando marcações ópticas de 1 a ${exam.totalQuestions}...`);
    await this.delay(400);

    const mockResults: ExamAnswerMap = {};
    const validLetters: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

    for (let q = 1; q <= exam.totalQuestions; q++) {
      const official = exam.answerKey[q] || 'B';
      // Simulação estatística com alta taxa de acerto realista (~82%)
      if (Math.random() > 0.18) {
        mockResults[q] = official;
      } else {
        const wrongPool = validLetters.filter(l => l !== official);
        mockResults[q] = wrongPool[Math.floor(Math.random() * wrongPool.length)];
      }
    }

    return mockResults;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
