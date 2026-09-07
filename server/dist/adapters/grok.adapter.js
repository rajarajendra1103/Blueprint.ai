"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrokAdapter = void 0;
class GrokAdapter {
    id = 'grok';
    name = 'xAI Grok';
    async generate(prompt, apiKey, model = 'grok-2-latest', options) {
        const cleanKey = apiKey.trim();
        if (!cleanKey)
            throw new Error('xAI Grok API key is required.');
        const messages = [];
        if (options?.systemPrompt) {
            messages.push({ role: 'system', content: options.systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${cleanKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens || 4096,
            }),
        });
        if (!response.ok) {
            const errText = await response.text();
            let errJson = null;
            try {
                errJson = JSON.parse(errText);
            }
            catch { }
            throw new Error(`xAI Grok API Error (${response.status}): ${errJson?.error || errText}`);
        }
        const data = (await response.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('xAI Grok returned empty response');
        }
        return content;
    }
    async validateKey(apiKey, _model) {
        const cleanKey = apiKey.trim();
        if (!cleanKey) {
            return { valid: false, message: 'xAI Grok API key cannot be empty.' };
        }
        try {
            const response = await fetch('https://api.x.ai/v1/models', {
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
                    message: json?.error || `xAI API returned HTTP ${response.status}`,
                };
            }
            return { valid: true, message: 'xAI Grok API key successfully verified.' };
        }
        catch (err) {
            return { valid: false, message: err.message || 'Failed to connect to xAI API.' };
        }
    }
}
exports.GrokAdapter = GrokAdapter;
