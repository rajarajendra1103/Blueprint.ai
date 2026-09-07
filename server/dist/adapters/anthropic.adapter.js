"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicAdapter = void 0;
class AnthropicAdapter {
    id = 'anthropic';
    name = 'Anthropic Claude';
    async generate(prompt, apiKey, model = 'claude-3-5-sonnet-20241022', options) {
        if (!apiKey)
            throw new Error('Anthropic API key is required.');
        const body = {
            model,
            max_tokens: options?.maxTokens || 4096,
            messages: [{ role: 'user', content: prompt }],
            temperature: options?.temperature ?? 0.7,
        };
        if (options?.systemPrompt) {
            body.system = options.systemPrompt;
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
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
            throw new Error(`Anthropic API Error (${response.status}): ${errJson?.error?.message || errText}`);
        }
        const data = (await response.json());
        const content = data.content?.[0]?.text;
        if (!content) {
            throw new Error('Anthropic returned empty response');
        }
        return content;
    }
    async validateKey(apiKey, model = 'claude-3-5-haiku-20241022') {
        try {
            await this.generate('Ping. Reply with "pong".', apiKey, model, { maxTokens: 10 });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, message: err.message };
        }
    }
}
exports.AnthropicAdapter = AnthropicAdapter;
