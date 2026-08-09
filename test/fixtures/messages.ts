import type { UIMessage } from 'ai';

export function userMessage(text: string, id = 'user-1'): UIMessage {
  return {
    id,
    role: 'user',
    parts: [{ type: 'text', text, state: 'done' }],
  };
}

export function assistantTextMessage(text: string, id = 'assistant-1'): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text, state: 'done' }],
  };
}

export function assistantReasoningMessage(reasoning: string, text: string, id = 'assistant-2'): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [
      { type: 'reasoning', text: reasoning, state: 'done' },
      { type: 'text', text, state: 'done' },
    ],
  };
}

export function assistantToolMessage(id = 'assistant-tool'): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [
      {
        type: 'tool-scene-mood-analysis',
        toolCallId: 'call-1',
        title: 'Mood analysis',
        state: 'output-available',
        input: { prompt: 'Make it cozy' },
        output: {
          score: 88,
          label: 'Strong cozy signal',
          summary: 'The request points toward cozy styling with a clear visual direction.',
          recommendations: ['Use the suggested palette to anchor the room mood.'],
          sceneUpdate: { lightingMood: 'cozy' },
        },
      },
      { type: 'text', text: 'Here is the analysis.', state: 'done' },
    ],
  };
}

export function assistantFileMessage(id = 'assistant-file'): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [
      {
        type: 'file',
        mediaType: 'image/png',
        filename: 'floorplan.png',
        url: 'data:image/png;base64,AAAA',
      },
    ],
  };
}

export function assistantSourceMessage(id = 'assistant-source'): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [
      {
        type: 'source-url',
        sourceId: 'src-1',
        url: 'https://example.com/article',
        title: 'Room styling guide',
      },
    ],
  };
}
