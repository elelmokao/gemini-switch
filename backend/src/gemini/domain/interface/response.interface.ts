import { Content } from '@google/generative-ai';
export interface GenAiResponse {
  totalTokens: number;
  text: string;
}

export interface ChatPayload {
  prompt: string;
  history: Content[];
  model: string;
  api_key?: string;
  mentioned_persona_ids?: string[];
  system_instruction?: string; // System instruction from persona
  persona_model?: string; // Model specified by persona
}
