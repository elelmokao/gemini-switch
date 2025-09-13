import { GenerativeModel } from '@google/generative-ai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { GenAiResponse } from '../../gemini/domain/interface/response.interface';
import { createContent } from './helpers/content.helper';
import { GEMINI_FLASH_MODEL, GEMINI_PRO_MODEL } from './gemini.constant';
import { envConfig } from 'src/config/env.config';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    @Inject(GEMINI_PRO_MODEL) private readonly proModel: GenerativeModel,
    @Inject(GEMINI_FLASH_MODEL) private readonly flashModel: GenerativeModel,
  ) {}

  async generateText(prompt: string): Promise<GenAiResponse> {
    const contents = createContent(prompt);

    const modelType = envConfig.GEMINI.GEMINI_MODEL.includes('flash')
      ? 'flash'
      : 'pro';
    const model = modelType === 'flash' ? this.flashModel : this.proModel;
    this.logger.log(`Using Model: ${envConfig.GEMINI.GEMINI_MODEL}`);

    const { totalTokens } = await model.countTokens({ contents });
    this.logger.log(`Consuming Tokens: ${JSON.stringify(totalTokens)}`);

    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    return { totalTokens, text };
  }
}
