// dto of personas
export interface CreatePersonasDto {
  user_id: string;
  name: string;
  description?: string | null;
  system_prompt: string;
  model_used: string;
  api_key_id: string;
}
