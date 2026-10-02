import { IVisionService } from './IVisionService';
import { VisionConfig } from '../../types/vision';
import { SimulatedVisionService } from './SimulatedVisionService';
import { GeminiVisionService } from './GeminiVisionService';
import { OpenAIVisionService } from './OpenAIVisionService';

export class VisionServiceFactory {
  public static create(config: VisionConfig): IVisionService {
    switch (config.engine) {
      case 'gemini':
        if (!config.apiKey) {
          throw new Error("Por favor, configure sua chave do Google AI Studio nas configurações.");
        }
        return new GeminiVisionService(config.apiKey);

      case 'openai':
        if (!config.apiKey) {
          throw new Error("Por favor, configure sua chave da OpenAI nas configurações.");
        }
        return new OpenAIVisionService(config.apiKey);

      case 'simulated':
      default:
        return new SimulatedVisionService();
    }
  }
}
