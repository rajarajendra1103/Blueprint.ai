import { LLMProvider, GenerateOptions, KeyValidationResult } from './llm.interface';

export class ClaudeAdapter implements LLMProvider {
  readonly id = 'claude' as const;
  readonly name = 'Anthropic Claude';

  async generate(
    prompt: string,
    apiKey: string,
    model: string = 'claude-3-7-sonnet-20250219',
    options?: GenerateOptions
  ): Promise<string> {
    const cleanKey = apiKey.trim();
    if (!cleanKey) throw new Error('Anthropic Claude API key is required.');

    const body: any = {
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
      let errJson: any = null;
      try {
        errJson = JSON.parse(errText);
      } catch {}
      const errMsg = errJson?.error?.message || errText;
      throw new Error(`Anthropic Claude API Error (${response.status}): ${errMsg}`);
    }

    const data = (await response.json()) as any;
    const textParts = data.content?.filter((c: any) => c.type === 'text');
    const content = textParts?.map((c: any) => c.text).join('\n') || '';

    if (!content.trim()) {
      throw new Error('Anthropic Claude returned an empty response.');
    }

    return content;
  }

  async validateKey(apiKey: string, model?: string): Promise<KeyValidationResult> {
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
        let json: any = null;
        try { json = JSON.parse(text); } catch {}
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
      let pingJson: any = null;
      try { pingJson = JSON.parse(pingText); } catch {}

      return {
        valid: false,
        message: pingJson?.error?.message || `Anthropic returned HTTP ${pingResponse.status}`,
      };
    } catch (err: any) {
      return {
        valid: false,
        message: err.message || 'Failed to connect to Anthropic Claude API.',
      };
    }
  }
}
