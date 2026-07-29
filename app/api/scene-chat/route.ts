import { NextRequest } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import {
  AI_MAX_TOKENS,
  AI_MODEL,
  AI_TEMPERATURE,
  SPATIALSTAGER_SYSTEM_PROMPT,
} from '@/lib/aiModelConfig';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { sceneMoodAnalysisTool } from '@/lib/tools/sceneMoodAnalysis';

function extractTextFromMessages(messages: UIMessage[]): string {
  return messages
    .map((message) =>
      message.parts
        .filter((part) => part.type === 'text')
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('')
        .trim(),
    )
    .filter(Boolean)
    .join('\n');
}

function buildMockToolStream(messages: UIMessage[]) {
  const prompt = extractTextFromMessages(messages).trim() || 'Create a calmer room feel';

  return createUIMessageStream({
    async execute({ writer }) {
      const toolCallId = `tool-${Date.now()}`;
      const input = {
        prompt,
        roomContext: 'living room',
      };

      writer.write({
        type: 'tool-input-start',
        toolCallId,
        toolName: 'sceneMoodAnalysis',
        title: 'Mood analysis',
      });
      writer.write({
        type: 'tool-input-delta',
        toolCallId,
        inputTextDelta: JSON.stringify(input),
      });
      writer.write({
        type: 'tool-input-available',
        toolCallId,
        toolName: 'sceneMoodAnalysis',
        input,
      });

      try {
        const output = await sceneMoodAnalysisTool.execute(input);
        writer.write({
          type: 'tool-output-available',
          toolCallId,
          output,
        });

        writer.write({ type: 'text-start', id: 'assistant-text' });
        writer.write({
          type: 'text-delta',
          id: 'assistant-text',
          delta: `${output.summary}\n\n${output.label} · score ${output.score}/100`,
        });
        writer.write({ type: 'text-end', id: 'assistant-text' });
      } catch (error) {
        const errorText = error instanceof Error ? error.message : 'Unable to analyze the request';
        writer.write({
          type: 'tool-output-error',
          toolCallId,
          errorText,
        });

        writer.write({ type: 'text-start', id: 'assistant-text' });
        writer.write({
          type: 'text-delta',
          id: 'assistant-text',
          delta: `The mood analysis hit a snag: ${errorText}`,
        });
        writer.write({ type: 'text-end', id: 'assistant-text' });
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
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const stream = buildMockToolStream(messages);
      return createUIMessageStreamResponse({ stream });
    }

    const result = streamText({
      model: anthropic(AI_MODEL),
      system: `${SPATIALSTAGER_SYSTEM_PROMPT}\nWhen a user asks for a restyle direction, use the sceneMoodAnalysis tool before answering.`,
      messages: await convertToModelMessages(messages),
      temperature: AI_TEMPERATURE,
      maxOutputTokens: AI_MAX_TOKENS,
      abortSignal: req.signal,
      tools: {
        sceneMoodAnalysis: sceneMoodAnalysisTool,
      },
      toolChoice: 'auto',
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (err) {
    console.error('[scene-chat] POST error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
