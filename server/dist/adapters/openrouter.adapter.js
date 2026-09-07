"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterAdapter = void 0;
class OpenRouterAdapter {
    id = 'openrouter';
    name = 'OpenRouter';
    async executeRequest(model, apiKey, prompt, options) {
        const messages = [];
        if (options?.systemPrompt) {
            messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const body = {
            model,
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens || 4096,
        };
        if (options?.responseFormatJson) {
            body.response_format = { type: 'json_object' };
        }
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://blueprint.ai',
                'X-Title': 'Blueprint.ai',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errText = await response.text();
            let errJson;
            try {
                errJson = JSON.parse(errText);
            }
            catch {
                errJson = null;
            }
            const errMsg = errJson?.error?.message || errText;
            const error = new Error(`OpenRouter API Error (${response.status}): ${errMsg}`);
            error.status = response.status;
            error.openRouterMessage = errMsg;
            throw error;
        }
        const data = (await response.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('OpenRouter returned empty response');
        }
        return content;
    }
    async generate(prompt, apiKey, model = 'openrouter/free', options) {
        if (!apiKey)
            throw new Error('OpenRouter API key is required.');
        const isFreeModel = model.includes(':free') || model === 'openrouter/free';
        const fallbackFreeModels = [
            'openrouter/free',
            'google/gemma-4-31b-it:free',
            'nvidia/nemotron-3-super-120b-a12b:free',
            'nvidia/nemotron-3.5-lightning:free',
            'minimax/minimax-m3:free',
            'cohere/north-mini-code:free',
            'google/gemma-4-26b-a4b-it:free',
        ].filter((m) => m !== model);
        try {
            return await this.executeRequest(model, apiKey, prompt, options);
        }
        catch (err) {
            // If a free model returned 404 (unavailable for free) or transient 503/429
            if (isFreeModel && (err.status === 404 || err.message?.includes('unavailable for free'))) {
                for (const fallback of fallbackFreeModels) {
                    try {
                        console.warn(`[OpenRouter] '${model}' is unavailable for free. Automatically falling back to: ${fallback}`);
                        return await this.executeRequest(fallback, apiKey, prompt, options);
                    }
                    catch (fallbackErr) {
                        console.warn(`[OpenRouter] Fallback '${fallback}' failed:`, fallbackErr.message);
                        continue;
                    }
                }
            }
            throw err;
        }
    }
    async validateKey(apiKey, _model) {
        const cleanKey = apiKey.trim();
        if (!cleanKey) {
            return { valid: false, message: 'OpenRouter API key cannot be empty.' };
        }
        try {
            const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
                headers: {
                    Authorization: `Bearer ${cleanKey}`,
                },
            });
            if (!response.ok) {
                const text = await response.text();
                let json = null;
                try {
                    json = JSON.parse(text);
                }
                catch { }
                return {
                    valid: false,
                    message: json?.error?.message || `OpenRouter returned HTTP ${response.status}: ${text.slice(0, 150)}`,
                };
            }
            const data = (await response.json());
            const label = data.data?.label ? ` (Key: "${data.data.label}")` : '';
            const usage = data.data?.usage != null ? ` • Used: $${Number(data.data.usage).toFixed(2)}` : '';
            const limit = data.data?.limit != null ? ` / Limit: $${data.data.limit}` : '';
            return {
                valid: true,
                message: `OpenRouter API key verified successfully!${label}${usage}${limit}`,
            };
        }
        catch (err) {
            return { valid: false, message: err.message || 'Failed to connect to OpenRouter API.' };
        }
    }
}
exports.OpenRouterAdapter = OpenRouterAdapter;
