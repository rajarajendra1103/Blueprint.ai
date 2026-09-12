"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeAdapter = void 0;
class ClaudeAdapter {
    id = 'claude';
    name = 'Anthropic Claude';
    async generate(prompt, apiKey, model = 'claude-3-7-sonnet-20250219', options) {
        const cleanKey = apiKey.trim();
        if (!cleanKey)
            throw new Error('Anthropic Claude API key is required.');
        const body = {
            model,
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature ?? 0.7,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        };
        if (options?.systemPrompt) {
            body.system = options.systemPrompt;
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': cleanKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errText = await response.text();
            let errJson = null;
            try {
                errJson = JSON.parse(errText);
            }
            catch { }
            const errMsg = errJson?.error?.message || errText;
            throw new Error(`Anthropic Claude API Error (${response.status}): ${errMsg}`);
        }
        const data = (await response.json());
        const textParts = data.content?.filter((c) => c.type === 'text');
        const content = textParts?.map((c) => c.text).join('\n') || '';
        if (!content.trim()) {
            throw new Error('Anthropic Claude returned an empty response.');
        }
        return content;
    }
    async validateKey(apiKey, model) {
        const cleanKey = apiKey.trim();
        if (!cleanKey) {
            return { valid: false, message: 'Anthropic Claude API key cannot be empty.' };
        }
        try {
            // 1. First attempt: Query Anthropic's models endpoint
            const response = await fetch('https://api.anthropic.com/v1/models', {
                headers: {
                    'x-api-key': cleanKey,
                    'anthropic-version': '2023-06-01',
                },
            });
            if (response.ok) {
                return {
                    valid: true,
                    message: 'Anthropic Claude API key verified successfully!',
                };
            }
            // If unauthorized / forbidden, return clear error
            if (response.status === 401 || response.status === 403) {
                const text = await response.text();
                let json = null;
                try {
                    json = JSON.parse(text);
                }
                catch { }
                return {
                    valid: false,
                    message: json?.error?.message || `Invalid Anthropic API Key (HTTP ${response.status})`,
                };
            }
            // 2. Fallback: Minimal 1-token message ping
            const pingResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': cleanKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: model || 'claude-3-5-haiku-20241022',
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'hi' }],
                }),
            });
            if (pingResponse.ok) {
                return {
                    valid: true,
                    message: 'Anthropic Claude API key verified successfully!',
                };
            }
            const pingText = await pingResponse.text();
            let pingJson = null;
            try {
                pingJson = JSON.parse(pingText);
            }
            catch { }
            return {
                valid: false,
                message: pingJson?.error?.message || `Anthropic returned HTTP ${pingResponse.status}`,
            };
        }
        catch (err) {
            return {
                valid: false,
                message: err.message || 'Failed to connect to Anthropic Claude API.',
            };
        }
    }
}
exports.ClaudeAdapter = ClaudeAdapter;
