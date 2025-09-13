import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Provider } from '@nestjs/common';
import { envConfig } from '../../config/env.config';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from '../../config/gemini.config';
import { GEMINI_PRO_MODEL, GEMINI_FLASH_MODEL } from './gemini.constant';

export const GeminiProModelProvider: Provider<GenerativeModel> = {
  provide: GEMINI_PRO_MODEL,
  useFactory: () => {
    const genAI = new GoogleGenerativeAI(envConfig.GEMINI.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
      model: 'gemini-2.0-pro',
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  },
};
export const GeminiFlashModelProvider: Provider<GenerativeModel> = {
  provide: GEMINI_FLASH_MODEL,
  useFactory: () => {
    const genAI = new GoogleGenerativeAI(envConfig.GEMINI.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  },
};
