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
            signal: AbortSignal.timeout(25000),
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
        let content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('OpenRouter returned empty response');
        }
        // Strip guardrail/safety filter preambles (e.g., Nemotron "User Safety: safe")
        content = content.replace(/^(?:User\s+Safety|Safety|Content\s+Filter|Moderation):\s*(?:safe|unsafe|passed|pass|ok)\s*\n*/i, '').trim();
        return content;
    }
    async generate(prompt, apiKey, model = 'openrouter/free', options) {
        if (!apiKey)
            throw new Error('OpenRouter API key is required.');
        const isFreeModel = model.includes(':free') || model === 'openrouter/free';
        const fallbackFreeModels = [
            'openrouter/free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'qwen/qwen-2.5-coder-32b-instruct:free',
            'google/gemma-3-27b-it:free',
        ].filter((m) => m !== model);
        const isExhaustedOrRateLimited = (e) => {
            const msg = (e.message || '').toLowerCase();
            const st = e.status;
            return (st === 429 ||
                st === 402 ||
                st === 404 ||
                st === 503 ||
                msg.includes('rate limit') ||
                msg.includes('too many requests') ||
                msg.includes('quota') ||
                msg.includes('credit') ||
                msg.includes('free tier') ||
                msg.includes('unavailable for free') ||
                msg.includes('limit reached') ||
                msg.includes('empty response') ||
                msg.includes('timeout'));
        };
        try {
            return await this.executeRequest(model, apiKey, prompt, options);
        }
        catch (err) {
            if (isFreeModel && isExhaustedOrRateLimited(err)) {
                console.warn(`[OpenRouter] '${model}' hit rate limit or is unavailable (${err.message}). Attempting free fallbacks...`);
                for (const fallback of fallbackFreeModels.slice(0, 2)) {
                    try {
                        console.warn(`[OpenRouter] Trying fallback free model: ${fallback}`);
                        return await this.executeRequest(fallback, apiKey, prompt, options);
                    }
                    catch (fallbackErr) {
                        console.warn(`[OpenRouter] Fallback '${fallback}' failed:`, fallbackErr.message);
                        continue;
                    }
                }
                const friendlyError = new Error(`Free tier limit reached for model '${model}' on OpenRouter. The free requests / rate limits for this model have been exceeded. Please click "Change Model" in Provider Settings to select another free model or switch to Google Gemini.`);
                friendlyError.status = 429;
                friendlyError.isFreeTierExhausted = true;
                throw friendlyError;
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
