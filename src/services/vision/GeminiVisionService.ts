import { IVisionService } from './IVisionService';
import { AnswerOption, ExamAnswerMap } from '../../types/grading';
import { VisionProgressCallback } from '../../types/vision';
import { Exam } from '../../types/exam';

export class GeminiVisionService implements IVisionService {
  constructor(private readonly apiKey: string) {
    if (!apiKey?.trim()) {
      throw new Error("Chave de API do Google Gemini não configurada.");
    }
  }

  public async extractAnswers(
    imageBase64: string,
    exam: Exam,
    onProgress?: VisionProgressCallback
  ): Promise<ExamAnswerMap> {
    onProgress?.(`Preparando imagem para a prova "${exam.title}" (${exam.totalQuestions} questões)...`);

    const commaIndex = imageBase64.indexOf(',');
    const pureBase64 = commaIndex !== -1 ? imageBase64.substring(commaIndex + 1) : imageBase64;
    const mimeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*;/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const promptText = `Você é um sistema profissional de leitura óptica (OMR).
Examine com atenção a folha de respostas da prova "${exam.title}" contendo EXATAMENTE ${exam.totalQuestions} questões numeradas de 1 a ${exam.totalQuestions}.
Identifique qual alternativa (A, B, C, D ou E) foi assinalada/preenchida para cada questão.
Se alguma questão estiver em branco ou com rasura ilegível, atribua "-".
Retorne EXCLUSIVAMENTE um objeto JSON válido mapeando o número da questão como chave string para a letra maiúscula correspondente.
Exemplo: {"1": "B", "2": "C", ..., "${exam.totalQuestions}": "A"}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const payload = {
      contents: [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType, data: pureBase64 } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    };

    onProgress?.("Aguardando inferência da IA multimodal Google Gemini...");

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.error?.message || `Erro HTTP ${response.status}`;
      throw new Error(`Falha no Google Gemini: ${message}`);
    }

    const jsonResponse = await response.json();
    const rawContent = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Resposta vazia da API do Gemini.");
    }

    onProgress?.("Validando e sanitizando respostas extraídas...");
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
