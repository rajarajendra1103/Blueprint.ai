"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDERS_META = void 0;
exports.getAdapter = getAdapter;
const gemini_adapter_1 = require("./gemini.adapter");
const openrouter_adapter_1 = require("./openrouter.adapter");
const nvidia_adapter_1 = require("./nvidia.adapter");
const grok_adapter_1 = require("./grok.adapter");
__exportStar(require("./llm.interface"), exports);
const adapters = {
    gemini: new gemini_adapter_1.GeminiAdapter(),
    openrouter: new openrouter_adapter_1.OpenRouterAdapter(),
    grok: new grok_adapter_1.GrokAdapter(),
    nvidia: new nvidia_adapter_1.NvidiaAdapter(),
};
function getAdapter(providerId) {
    const adapter = adapters[providerId];
    if (!adapter) {
        throw new Error(`Unsupported provider '${providerId}'. Supported: ${Object.keys(adapters).join(', ')}`);
    }
    return adapter;
}
exports.PROVIDERS_META = [
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
