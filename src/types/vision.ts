export type VisionEngineType = 'simulated' | 'gemini' | 'openai';

export interface VisionConfig {
  engine: VisionEngineType;
  apiKey?: string;
}

export interface VisionProgressCallback {
  (message: string): void;
}
