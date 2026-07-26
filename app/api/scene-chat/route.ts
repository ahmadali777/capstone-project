import { NextRequest } from 'next/server';
import { streamText, type ModelMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  AI_MAX_TOKENS,
  AI_MODEL,
  AI_TEMPERATURE,
  SPATIALSTAGER_SYSTEM_PROMPT,
  type SceneUpdate,
} from '@/lib/aiModelConfig';
import type { LightingMood, FloorMaterial } from '@/store/useStore';

type MockInterpretResult = {
  lightingMood: LightingMood;
  wallColor: string;
  floorMaterial: FloorMaterial;
};

function mockInterpret(message: string): MockInterpretResult {
  const m = message.toLowerCase();
  if (m.includes('cozy') || m.includes('warm')) {
    return { lightingMood: 'cozy', wallColor: '#e6c9a8', floorMaterial: 'wood' };
  }
  if (m.includes('bright') || m.includes('light') || m.includes('airy')) {
    return { lightingMood: 'bright', wallColor: '#f5f5f5', floorMaterial: 'tile' };
  }
  if (m.includes('dramatic') || m.includes('dark') || m.includes('moody')) {
    return { lightingMood: 'dramatic', wallColor: '#3a3f4b', floorMaterial: 'carpet' };
  }
  return { lightingMood: 'neutral', wallColor: '#e8e1d5', floorMaterial: 'wood' };
}

function buildMockResponse(userMessage: string, history: Array<{ role: string; content: string }>): string {
  const scene = mockInterpret(userMessage);
  const userTurnCount = history.filter((m) => m.role === 'user').length;
  const moodNarrative: Record<LightingMood, string> = {
    cozy: "I've warmed things up with a cozy atmosphere — soft lighting, earthy wall tones, and a natural wood floor to make the space feel inviting.",
    bright: "Let me open this space up! I've switched to bright lighting, crisp light walls, and clean tile flooring for an airy, fresh feel.",
    dramatic: "Going bold — moody lighting, deep rich walls, and a soft carpet underfoot create that dramatic, intimate vibe.",
    neutral: "I'll keep it balanced with neutral lighting, a warm neutral wall, and classic wood flooring. Easy to build on!",
  };
  let prose = moodNarrative[scene.lightingMood];
  if (userTurnCount > 1) {
    const prevUser = [...history].reverse().find((m, i, arr) => {
      const next = arr[i + 1];
      return m.role === 'user' && next && next.role === 'assistant';
    });
    if (prevUser) {
      prose = `Got it — switching things up. ${prose} You asked for "${prevUser.content}" earlier, so this new direction should feel intentional.`;
    }
  }
  const jsonLine = JSON.stringify(scene satisfies SceneUpdate);
  return `${prose}\n${jsonLine}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* mockStreamChunks(text: string, signal: AbortSignal): AsyncGenerator<string> {
  const charsPerTick = 2;
  for (let i = 0; i < text.length; i += charsPerTick) {
    if (signal.aborted) return;
    await sleep(25);
    if (signal.aborted) return;
    yield text.slice(i, i + charsPerTick);
  }
}

function mockTextStreamResponse(text: string, signal: AbortSignal): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of mockStreamChunks(text, signal)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Stream-Mode': 'mock',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages as Array<{ role: string; content: string }> | undefined;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const mockText = buildMockResponse(lastUserMessage, messages);
      return mockTextStreamResponse(mockText, req.signal);
    }

    const coreMessages: ModelMessage[] = messages.map((m) => {
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      return { role, content: m.content };
    });

    const result = streamText({
      model: anthropic(AI_MODEL),
      system: SPATIALSTAGER_SYSTEM_PROMPT,
      messages: coreMessages,
      temperature: AI_TEMPERATURE,
      maxOutputTokens: AI_MAX_TOKENS,
      abortSignal: req.signal,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('[scene-chat] POST error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
