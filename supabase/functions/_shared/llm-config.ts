/**
 * Shared LLM config for all BoomStart edge functions.
 * Change provider by updating Supabase secrets — zero code changes.
 *
 * Supported providers (all OpenAI-compatible):
 *   Lovable:  https://ai.gateway.lovable.dev/v1/chat/completions  LOVABLE_API_KEY
 *   OpenAI:   https://api.openai.com/v1/chat/completions           OPENAI_API_KEY
 *   Abacus:   https://apps.abacus.ai/v1/chat/completions           ABACUSAI_API_KEY
 *   Groq:     https://api.groq.com/openai/v1/chat/completions      GROQ_API_KEY
 */

export interface LLMConfig {
  apiUrl: string;
  model: string;
  apiKey: string;
}

export function getLLMConfig(): LLMConfig {
  const apiKey =
    Deno.env.get('LLM_API_KEY') ||
    Deno.env.get('LOVABLE_API_KEY') ||
    Deno.env.get('OPENAI_API_KEY') ||
    Deno.env.get('ABACUSAI_API_KEY') ||
    Deno.env.get('GROQ_API_KEY') ||
    '';

  const apiUrl =
    Deno.env.get('LLM_API_URL') ||
    'https://ai.gateway.lovable.dev/v1/chat/completions';

  const model =
    Deno.env.get('LLM_MODEL') ||
    'google/gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('No LLM API key configured. Set LLM_API_KEY in Supabase secrets.');
  }

  return { apiUrl, model, apiKey };
}

export interface CallLLMOptions {
  systemPrompt: string;
  userMessage: string | unknown[];
  temperature?: number;
  maxTokens?: number;
}

export async function callLLM(opts: CallLLMOptions, retries = 1): Promise<string> {
  const { apiUrl, model, apiKey } = getLLMConfig();

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userMessage },
    ],
    temperature: opts.temperature ?? 0.7,
  };

  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      if (response.status === 429) throw new Error('Rate limit exceeded. Try again in a moment.');
      if (response.status === 402) throw new Error('AI credits depleted. Add funds to continue.');
      throw new Error(`AI API error ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI returned empty response.');
    return content;
  } catch (error) {
    if (retries > 0 && error instanceof Error && /\b5\d{2}\b/.test(error.message)) {
      await new Promise((r) => setTimeout(r, 1000));
      return callLLM(opts, retries - 1);
    }
    throw error;
  }
}

/** Parse JSON from LLM response — handles markdown fences robustly */
export function parseJSON<T = unknown>(raw: string): T {
  // Direct parse
  try { return JSON.parse(raw) as T; } catch { /* fall through */ }

  // Strip markdown fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
  try { return JSON.parse(stripped) as T; } catch { /* fall through */ }

  // Extract first JSON object
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]) as T; } catch { /* fall through */ }
  }

  throw new Error(`Cannot parse JSON from AI response. Preview: "${raw.slice(0, 150)}"`);
}
