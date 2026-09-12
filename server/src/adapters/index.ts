import { LLMProviderId, ProviderMeta } from '@blueprint/shared';
import { LLMProvider } from './llm.interface';
import { GeminiAdapter } from './gemini.adapter';
import { ClaudeAdapter } from './claude.adapter';
import { OpenRouterAdapter } from './openrouter.adapter';
import { NvidiaAdapter } from './nvidia.adapter';
import { GrokAdapter } from './grok.adapter';
export * from './llm.interface';

const claudeInstance = new ClaudeAdapter();

const adapters: Record<LLMProviderId, LLMProvider> = {
  gemini: new GeminiAdapter(),
  claude: claudeInstance,
  anthropic: claudeInstance,
  openrouter: new OpenRouterAdapter(),
  grok: new GrokAdapter(),
  nvidia: new NvidiaAdapter(),
};

export function getAdapter(providerId: LLMProviderId): LLMProvider {
  const adapter = adapters[providerId];
  if (!adapter) {
    throw new Error(`Unsupported provider '${providerId}'. Supported: ${Object.keys(adapters).join(', ')}`);
  }
  return adapter;
}

export const PROVIDERS_META: ProviderMeta[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Ultra-fast multi-modal reasoning and massive context window directly via Google AI Studio.',
    defaultModel: 'gemini-3.5-flash',
    availableModels: [
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
    ],
    keyPlaceholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    requiresKey: true,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'State-of-the-art architectural reasoning, clean system topologies, and pristine code generation directly via Anthropic.',
    defaultModel: 'claude-3-7-sonnet-20250219',
    availableModels: [
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ],
    keyPlaceholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    requiresKey: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access dozens of top models through a single key. Free :free models require $0 credit balance.',
    defaultModel: 'openrouter/free',
    availableModels: [
      // Free Models Collection (0 credit balance needed)
      'openrouter/free',
      'google/gemma-4-31b-it:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'nvidia/nemotron-3.5-lightning:free',
      'minimax/minimax-m3:free',
      'cohere/north-mini-code:free',
      'google/gemma-4-26b-a4b-it:free',
      // Flagship / Production Models
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3.5-haiku',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/o3-mini',
      'openai/o1',
      'deepseek/deepseek-r1',
      'deepseek/deepseek-chat',
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.3-70b-instruct',
      'cohere/command-r-plus',
      'minimax/minimax-01',
    ],
    keyPlaceholder: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys',
    requiresKey: true,
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    description: 'Fast, unfiltered reasoning and real-time knowledge synthesis from xAI.',
    defaultModel: 'grok-2-latest',
    availableModels: [
      'grok-2-latest',
      'grok-2-1212',
      'grok-2-vision-1212',
      'grok-beta',
    ],
    keyPlaceholder: 'xai-...',
    docsUrl: 'https://console.x.ai',
    requiresKey: true,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    description: 'Enterprise accelerated inference for high-performance open models on NVIDIA DGX Cloud.',
    defaultModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
    availableModels: [
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'meta/llama-3.3-70b-instruct',
      'meta/llama-3.1-70b-instruct',
      'meta/llama-3.2-11b-vision-instruct',
      'mistralai/mistral-large-2-instruct',
      'mistralai/mixtral-8x22b-v0.1',
    ],
    keyPlaceholder: 'nvapi-...',
    docsUrl: 'https://build.nvidia.com',
    requiresKey: true,
  },
];
