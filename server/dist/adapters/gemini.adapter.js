"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAdapter = void 0;
class GeminiAdapter {
    id = 'gemini';
    name = 'Google Gemini';
    async executeGenerate(prompt, cleanKey, model, options) {
        const cleanModel = model.replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${cleanKey}`;
        const body = {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: options?.temperature ?? 0.7,
                maxOutputTokens: options?.maxTokens || 4096,
            },
        };
        if (options?.systemPrompt) {
            body.systemInstruction = {
                parts: [{ text: options.systemPrompt }],
            };
        }
        if (options?.responseFormatJson) {
            body.generationConfig.responseMimeType = 'application/json';
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            const err = new Error(`Gemini API Error (${response.status}): ${errJson?.error?.message || errText}`);
            err.status = response.status;
            throw err;
        }
        const data = (await response.json());
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
            throw new Error('Gemini returned empty response or content was blocked.');
        }
        return content;
    }
    async generate(prompt, apiKey, model = 'gemini-3.5-flash', options) {
        const cleanKey = apiKey.trim();
        if (!cleanKey)
            throw new Error('Gemini API key is required.');
        const fallbacks = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'].filter((m) => m !== model);
        try {
            return await this.executeGenerate(prompt, cleanKey, model, options);
        }
        catch (err) {
            if (err.status === 503 || err.status === 404 || err.message?.includes('high demand') || err.message?.includes('not found')) {
                for (const fb of fallbacks) {
                    try {
                        console.warn(`[Gemini] '${model}' encountered ${err.status || 'error'}. Falling back to: ${fb}`);
                        return await this.executeGenerate(prompt, cleanKey, fb, options);
                    }
                    catch {
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
            return { valid: false, message: 'Gemini API key cannot be empty.' };
        }
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
            if (!res.ok) {
                const text = await res.text();
                let json = null;
                try {
                    json = JSON.parse(text);
                }
                catch { }
                return {
                    valid: false,
                    message: json?.error?.message || `Google API error (HTTP ${res.status}): ${text.slice(0, 150)}`,
                };
            }
            return { valid: true, message: 'Google Gemini API key successfully verified.' };
        }
        catch (err) {
            return { valid: false, message: err.message || 'Failed to connect to Google Gemini API.' };
        }
    }
}
exports.GeminiAdapter = GeminiAdapter;
