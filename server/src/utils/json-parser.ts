/**
 * Robust JSON extraction and parsing utility for LLM responses.
 * Handles markdown code fences, thought tokens, guardrail/safety preambles,
 * unescaped characters, and trailing commas.
 */

export function extractAndParseJson<T = any>(rawResponse: string): T {
  if (!rawResponse || typeof rawResponse !== 'string') {
    throw new Error('Empty response received from LLM');
  }

  // 1. Strip think / reasoning blocks (e.g. <think>...</think>)
  let text = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Strip guardrail or safety preambles (e.g. "User Safety: safe", "Safety: safe")
  text = text
    .replace(/^(?:User\s+Safety|Safety|Content\s+Filter|Moderation):\s*(?:safe|unsafe|passed|pass|ok)\s*\n*/i, '')
    .trim();

  // 3. Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // 4. Try extracting from markdown code block ```json ... ``` or ``` ... ``` anywhere in text
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
    const blockContent = blockMatch[1].trim();
    try {
      return JSON.parse(blockContent);
    } catch {
      // Try fixing trailing commas
      try {
        const cleaned = blockContent.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  // 5. Try finding the outermost JSON object { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  // 6. Try finding the outermost JSON array [ ... ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = text.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch {}
    }
  }

  throw new Error(`Could not extract valid JSON from LLM output. Snippet: ${rawResponse.slice(0, 200)}`);
}
