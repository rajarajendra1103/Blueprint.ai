"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapidApiAdapter = void 0;
class RapidApiAdapter {
    id = 'rapidapi';
    name = 'RapidAPI AI';
    async generate(prompt, apiKey, model = 'gpt-4o-mini', options) {
        if (!apiKey)
            throw new Error('RapidAPI key is required.');
        // RapidAPI OpenAI/LLM endpoint integration
        const response = await fetch('https://cheapest-gpt-4-turbo-gpt-4-with-vision-gpt-4.p.rapidapi.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'cheapest-gpt-4-turbo-gpt-4-with-vision-gpt-4.p.rapidapi.com',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model,
                max_tokens: options?.maxTokens || 4096,
                temperature: options?.temperature ?? 0.7,
            }),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`RapidAPI Error (${response.status}): ${errText}`);
        }
        const data = (await response.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('RapidAPI returned empty response');
        }
        return content;
    }
    async validateKey(apiKey) {
        try {
            await this.generate('Ping. Reply with "pong".', apiKey, undefined, { maxTokens: 10 });
            return { valid: true };
        }
        catch (err) {
            return { valid: false, message: err.message };
        }
    }
}
exports.RapidApiAdapter = RapidApiAdapter;
