import { Content } from '@google/generative-ai';
export interface GenAiResponse {
  totalTokens: number;
  text: string;
}

export interface ChatPayload {
  prompt: string;
  history: Content[];
  model: string;
}
