import { GenerativeModel } from '@google/generative-ai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { GenAiResponse } from '../../gemini/domain/interface/response.interface';
import { createContent } from './helpers/content.helper';
import { GEMINI_PRO_MODEL } from './gemini.constant';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    @Inject(GEMINI_PRO_MODEL) private readonly proModel: GenerativeModel,
  ) {}

  async generateText(prompt: string): Promise<GenAiResponse> {
    const contents = createContent(prompt);

    const { totalTokens } = await this.proModel.countTokens({ contents });
    this.logger.log(`Consuming Tokens: ${JSON.stringify(totalTokens)}`);

    const result = await this.proModel.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    return { totalTokens, text };
  }
}
