import { LLMProvider, GenerateOptions, KeyValidationResult } from './llm.interface';

export class GrokAdapter implements LLMProvider {
  readonly id = 'grok' as const;
  readonly name = 'xAI Grok';

  async generate(prompt: string, apiKey: string, model: string = 'grok-2-latest', options?: GenerateOptions): Promise<string> {
    const cleanKey = apiKey.trim();
    if (!cleanKey) throw new Error('xAI Grok API key is required.');

    const messages: any[] = [];
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
      let errJson: any = null;
      try { errJson = JSON.parse(errText); } catch {}
      throw new Error(`xAI Grok API Error (${response.status}): ${errJson?.error || errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('xAI Grok returned empty response');
    }
    return content;
  }

  async validateKey(apiKey: string, _model?: string): Promise<KeyValidationResult> {
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
        let json: any = null;
        try { json = JSON.parse(text); } catch {}
        return {
          valid: false,
          message: json?.error || `xAI API returned HTTP ${response.status}`,
        };
      }

      return { valid: true, message: 'xAI Grok API key successfully verified.' };
    } catch (err: any) {
      return { valid: false, message: err.message || 'Failed to connect to xAI API.' };
    }
  }
}
