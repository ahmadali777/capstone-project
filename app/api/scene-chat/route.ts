import { NextRequest } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from 'ai';
import { SPATIALSTAGER_SYSTEM_PROMPT } from '@/lib/aiModelConfig';

const openRouterApiKey = process.env.OPENROUTER_API_KEY ?? process.env.GEMINI_API_KEY;
const OPENROUTER_MODEL = 'google/gemini-2.5-flash-lite';

function extractTextFromMessages(messages: UIMessage[]): string {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return (latestUserMessage?.parts ?? [])
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim();
}

async function streamTextWithTokens(writer: { write: (message: any) => void }, text: string, delayMs = 30) {
  const trimmed = text.trim();
  if (!trimmed) return;

  writer.write({ type: 'text-start', id: 'assistant-text' });
  for (const token of trimmed.split(/(\s+)/).filter(Boolean)) {
    writer.write({ type: 'text-delta', id: 'assistant-text', delta: token });
    if (token.trim()) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
  }
  writer.write({ type: 'text-end', id: 'assistant-text' });
}

function buildChatStream(messages: UIMessage[]) {
  const prompt = extractTextFromMessages(messages) || 'Design a calm and functional room';
  return createUIMessageStream({
    async execute({ writer }) {
      if (!openRouterApiKey) {
        const fallback = 'I’m ready to help, but the OpenRouter API key is not configured yet. Add OPENROUTER_API_KEY to .env.local and restart the server.';
        await streamTextWithTokens(writer, fallback);
        return;
      }

      try {
        // Only the latest message is sent, keeping each request compact.
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${openRouterApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
              { role: 'system', content: SPATIALSTAGER_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            max_tokens: 600,
            temperature: 0.2,
          }),
        });
        if (!response.ok) throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);

        const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const responseText = data.choices?.[0]?.message?.content?.trim();
        if (!responseText) throw new Error('OpenRouter returned an empty response.');

        await streamTextWithTokens(writer, responseText);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[scene-chat] OpenRouter error:', message);
        const normalized = message.toLowerCase();
        const isQuotaIssue = normalized.includes('429') || normalized.includes('quota') || normalized.includes('rate-limit');
        const isAuthIssue = normalized.includes('401') || normalized.includes('403') || normalized.includes('unauthorized') || normalized.includes('invalid');
        const fallback = isQuotaIssue
          ? 'The AI service is currently rate-limited or out of credits. Please try again shortly.'
          : isAuthIssue
            ? 'The API key was rejected. Check the key in .env.local and that it has credits.'
            : `The assistant could not reach the AI service: ${message.slice(0, 200)}`;
        await streamTextWithTokens(writer, fallback);
      }
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = (body?.messages as UIMessage[] | undefined) ?? [];
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return createUIMessageStreamResponse({ stream: buildChatStream(messages) });
  } catch (error) {
    console.error('[scene-chat] POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
