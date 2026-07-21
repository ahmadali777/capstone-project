import { NextRequest, NextResponse } from 'next/server';

type LightingMood = 'cozy' | 'bright' | 'dramatic' | 'neutral';
type FloorMaterial = 'wood' | 'tile' | 'carpet';

/**
 * v1: a simple keyword matcher stands in for the AI call so the chat
 * feature works instantly with no API key. This ALSO demonstrates the
 * core safety pattern for the real version: never let the model emit
 * free-form values, always constrain to this fixed enum.
 */
function mockInterpret(message: string): {
  lightingMood: LightingMood;
  wallColor: string;
  floorMaterial: FloorMaterial;
} {
  const m = message.toLowerCase();
  if (m.includes('cozy') || m.includes('warm')) {
    return { lightingMood: 'cozy', wallColor: '#e6c9a8', floorMaterial: 'wood' };
  }
  if (m.includes('bright') || m.includes('light')) {
    return { lightingMood: 'bright', wallColor: '#f5f5f5', floorMaterial: 'tile' };
  }
  if (m.includes('dramatic') || m.includes('dark') || m.includes('moody')) {
    return { lightingMood: 'dramatic', wallColor: '#3a3f4b', floorMaterial: 'carpet' };
  }
  return { lightingMood: 'neutral', wallColor: '#e8e1d5', floorMaterial: 'wood' };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

    // ---- MOCK (default, no API key needed) ----
    const result = mockInterpret(message);

    /* ---- REAL VERSION (uncomment once you add OPENAI_API_KEY to .env.local) ----
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Map the user request to ONLY this JSON shape, values MUST come from these enums: ' +
              '{"lightingMood": "cozy|bright|dramatic|neutral", "wallColor": "#hex", "floorMaterial": "wood|tile|carpet"}. ' +
              'No prose, no markdown fences, JSON only.',
          },
          { role: 'user', content: message },
        ],
        max_tokens: 100,
      }),
    });
    const aiJson = await aiRes.json();
    const result = JSON.parse(aiJson.choices[0].message.content);
    */

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
