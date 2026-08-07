import { NextRequest } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from 'ai';
import Groq from 'groq-sdk';
import { SPATIALSTAGER_SYSTEM_PROMPT } from '@/lib/aiModelConfig';

const openRouterApiKey = process.env.OPENROUTER_API_KEY ?? process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const OPENROUTER_MODEL = 'openai/gpt-4o-mini';
const GROQ_MODEL = 'openai/gpt-oss-120b';

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

function buildFallbackMessage(message: string) {
  const normalized = message.toLowerCase();
  const isQuotaIssue = normalized.includes('429') || normalized.includes('quota') || normalized.includes('rate-limit') || normalized.includes('insufficient credits');
  const isAuthIssue = normalized.includes('401') || normalized.includes('403') || normalized.includes('unauthorized') || normalized.includes('invalid');

  if (isQuotaIssue) {
    return 'The AI service is currently rate-limited or out of credits. Please try again shortly.';
  }

  if (isAuthIssue) {
    return 'The OpenRouter key was rejected. Check the key in .env.local and make sure the account has access to the selected model.';
  }

  return `The assistant could not reach the AI service: ${message.slice(0, 200)}`;
}

function buildChatStream(messages: UIMessage[]) {
  const prompt = extractTextFromMessages(messages) || 'Design a calm and functional room';
  return createUIMessageStream({
    async execute({ writer }) {
      if (!openRouterApiKey && !groqApiKey) {
        const fallback = 'I’m ready to help, but no AI key is configured yet. Add OPENROUTER_API_KEY or GROQ_API_KEY to .env.local and restart the server.';
        await streamTextWithTokens(writer, fallback);
        return;
      }

      try {
        if (groqApiKey) {
          const groq = new Groq({ apiKey: groqApiKey });
          const stream = await groq.chat.completions.create({
            messages: [
              { role: 'system', content: SPATIALSTAGER_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            model: GROQ_MODEL,
            temperature: 0.2,
            max_completion_tokens: 600,
            top_p: 1,
            stream: true,
          });

          writer.write({ type: 'text-start', id: 'assistant-text' });
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (typeof content === 'string' && content.length > 0) {
              writer.write({ type: 'text-delta', id: 'assistant-text', delta: content });
            }
          }
          writer.write({ type: 'text-end', id: 'assistant-text' });
          return;
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://localhost:3000',
            'X-Title': 'SpatialStager AI',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            stream: true,
            messages: [
              { role: 'system', content: SPATIALSTAGER_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            max_tokens: 600,
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('OpenRouter returned no stream body.');
        }

        const decoder = new TextDecoder();
        writer.write({ type: 'text-start', id: 'assistant-text' });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string | null } }>;
              };
              const content = parsed.choices?.[0]?.delta?.content;
              if (typeof content === 'string' && content.length > 0) {
                writer.write({ type: 'text-delta', id: 'assistant-text', delta: content });
              }
            } catch {
              // Ignore malformed stream fragments.
            }
          }
        }

        writer.write({ type: 'text-end', id: 'assistant-text' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[scene-chat] OpenRouter error:', message);
        await streamTextWithTokens(writer, buildFallbackMessage(message));
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
