import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5';

export interface AnthropicConfig {
  apiKey: string;
  model: string;
}

export function getAnthropicConfig(
  env: NodeJS.ProcessEnv = process.env,
): AnthropicConfig {
  const apiKey = env.ANTHROPIC_API_KEY?.trim() ?? '';
  const model = env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }

  return { apiKey, model };
}

let client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getAnthropicConfig().apiKey });
  }
  return client;
}
