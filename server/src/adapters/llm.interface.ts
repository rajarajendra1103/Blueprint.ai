import { LLMProviderId } from '@blueprint/shared';

export interface GenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface KeyValidationResult {
  valid: boolean;
  message?: string;
}

export interface LLMProvider {
  readonly id: LLMProviderId;
  readonly name: string;
  generate(prompt: string, apiKey: string, model?: string, options?: GenerateOptions): Promise<string>;
  validateKey(apiKey: string, model?: string): Promise<KeyValidationResult>;
}
