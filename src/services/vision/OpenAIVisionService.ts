import { IVisionService } from './IVisionService';
import { AnswerOption, ExamAnswerMap } from '../../types/grading';
import { VisionProgressCallback } from '../../types/vision';
import { Exam } from '../../types/exam';

export class OpenAIVisionService implements IVisionService {
  constructor(private readonly apiKey: string) {
    if (!apiKey?.trim()) {
      throw new Error("Chave de API da OpenAI não configurada.");
    }
  }

  public async extractAnswers(
    imageBase64: string,
    exam: Exam,
    onProgress?: VisionProgressCallback
  ): Promise<ExamAnswerMap> {
    onProgress?.(`Enviando folha da prova "${exam.title}" para OpenAI GPT-4o-mini...`);

    const promptText = `Identifique as alternativas assinaladas de 1 a ${exam.totalQuestions} nesta folha de respostas da prova "${exam.title}". Retorne estritamente um JSON {"1": "A", "2": "B", ..., "${exam.totalQuestions}": "D"}. Use "-" para questões não preenchidas.`;

    const payload = {
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: promptText },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }]
    };

    onProgress?.("Aguardando análise da visão computacional da OpenAI...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `Erro HTTP ${response.status}`;
      throw new Error(`Falha na OpenAI: ${message}`);
    }

    const jsonResponse = await response.json();
    const rawContent = jsonResponse.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Resposta vazia da OpenAI.");
    }

    onProgress?.("Formatando resultados...");
    return this.parseAndSanitize(rawContent, exam.totalQuestions);
  }

  private parseAndSanitize(rawJson: string, totalQuestions: number): ExamAnswerMap {
    const parsed = JSON.parse(rawJson) as Record<string, string>;
    const sanitized: ExamAnswerMap = {};

    for (let q = 1; q <= totalQuestions; q++) {
      const val = (parsed[String(q)] || parsed[q] || '-').trim().toUpperCase();
      sanitized[q] = ['A', 'B', 'C', 'D', 'E'].includes(val) ? (val as AnswerOption) : '-';
    }

    return sanitized;
  }
}
