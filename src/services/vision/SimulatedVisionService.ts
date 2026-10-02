import { IVisionService } from './IVisionService';
import { AnswerOption, ExamAnswerMap } from '../../types/grading';
import { OFFICIAL_ANSWER_KEY, TOTAL_EXAM_QUESTIONS } from '../../constants/answerKey';
import { VisionProgressCallback } from '../../types/vision';

export class SimulatedVisionService implements IVisionService {
  public async extractAnswers(
    _imageBase64: string,
    onProgress?: VisionProgressCallback
  ): Promise<ExamAnswerMap> {
    onProgress?.("Inicializando pipeline de simulação OMR...");
    await this.delay(600);

    onProgress?.("Detectando contornos e alinhamento da folha...");
    await this.delay(600);

    onProgress?.("Mapeando marcações ópticas das 40 questões...");
    await this.delay(400);

    const mockResults: ExamAnswerMap = {};
    const validLetters: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

    for (let q = 1; q <= TOTAL_EXAM_QUESTIONS; q++) {
      // Simulação estatística com alta taxa de acerto realista (~82%)
      const official = OFFICIAL_ANSWER_KEY[q];
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
