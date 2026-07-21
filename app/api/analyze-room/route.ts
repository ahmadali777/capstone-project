import { NextRequest, NextResponse } from 'next/server';

/**
 * v1: returns a mock style suggestion so the app is fully demoable
 * without any API key. Swap the MOCK block below for a real call once
 * you have an OpenAI or Anthropic key — see the commented example.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photo = formData.get('photo');
    if (!photo) {
      return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 });
    }

    // ---- MOCK (default, no API key needed) ----
    const mockOptions = [
      {
        moodTags: ['warm', 'minimal'],
        wallColor: '#e8d9c5',
        floorMaterial: 'wood',
        suggestedFurniture: ['sofa', 'plant', 'lamp'],
      },
      {
        moodTags: ['modern', 'bright'],
        wallColor: '#f0f0f0',
        floorMaterial: 'tile',
        suggestedFurniture: ['chair', 'table', 'rug'],
      },
    ];
    const suggestion = mockOptions[Math.floor(Math.random() * mockOptions.length)];

    /* ---- REAL VERSION (uncomment once you add OPENAI_API_KEY to .env.local) ----
    const bytes = await (photo as File).arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You analyze a room photo and respond with ONLY JSON: {"moodTags": string[], "wallColor": "#hex", "floorMaterial": "wood|tile|carpet", "suggestedFurniture": string[]}. No prose, no markdown fences.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this room and suggest a style.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });
    const aiJson = await aiRes.json();
    const suggestion = JSON.parse(aiJson.choices[0].message.content);
    */

    return NextResponse.json(suggestion);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to analyze photo' }, { status: 500 });
  }
}
