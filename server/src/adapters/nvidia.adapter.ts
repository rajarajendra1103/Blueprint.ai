import { LLMProvider, GenerateOptions, KeyValidationResult } from './llm.interface';

export class NvidiaAdapter implements LLMProvider {
  readonly id = 'nvidia' as const;
  readonly name = 'NVIDIA NIM';

  async generate(prompt: string, apiKey: string, model: string = 'nvidia/llama-3.1-nemotron-70b-instruct', options?: GenerateOptions): Promise<string> {
    const cleanKey = apiKey.trim();
    if (!cleanKey) throw new Error('NVIDIA API key is required.');

    const messages: any[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
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
      throw new Error(`NVIDIA NIM API Error (${response.status}): ${errJson?.detail || errJson?.title || errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('NVIDIA NIM returned empty response');
    }
    return content;
  }

  async validateKey(apiKey: string, _model?: string): Promise<KeyValidationResult> {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return { valid: false, message: 'NVIDIA API key cannot be empty.' };
    }

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let json: any = null;
        try { json = JSON.parse(errText); } catch {}
        const detail = json?.detail || json?.title || '';
        if (detail.includes('Not found for account')) {
          return {
            valid: false,
            message: 'NVIDIA API key authentic, but your build.nvidia.com account has 0 active NIM credits or needs to activate this model.',
          };
        }
        if (response.status === 403 || detail.includes('Authorization failed')) {
          return {
            valid: false,
            message: 'Invalid NVIDIA API key (Authorization failed).',
          };
        }
        return {
          valid: false,
          message: detail || `NVIDIA NIM returned HTTP ${response.status}`,
        };
      }

      return { valid: true, message: 'NVIDIA NIM API key successfully verified.' };
    } catch (err: any) {
      return { valid: false, message: err.message || 'Failed to connect to NVIDIA NIM API.' };
    }
  }
}
