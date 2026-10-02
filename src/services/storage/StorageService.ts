import { VisionConfig, VisionEngineType } from '../../types/vision';

const STORAGE_KEYS = {
  ENGINE: 'omr_vision_engine',
  API_KEY: 'omr_api_key'
} as const;

export class StorageService {
  public static getVisionConfig(): VisionConfig {
    const rawEngine = localStorage.getItem(STORAGE_KEYS.ENGINE);
    const engine: VisionEngineType = 
      rawEngine === 'gemini' || rawEngine === 'openai' ? rawEngine : 'simulated';
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';

    return { engine, apiKey };
  }

  public static saveVisionConfig(config: VisionConfig): void {
    localStorage.setItem(STORAGE_KEYS.ENGINE, config.engine);
    if (config.apiKey !== undefined) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, config.apiKey.trim());
    }
  }

  public static clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
}
