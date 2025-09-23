// dto of api_keys
export interface CreateApiKeysDto {
  user_id: string;
  api_key: string;
  description: string;
  token_used: number;
}
