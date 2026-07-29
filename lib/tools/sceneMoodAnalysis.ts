import { z } from 'zod';

export const sceneMoodAnalysisInputSchema = z.object({
  prompt: z.string().describe('The user request to analyze for a room restyle suggestion.'),
  roomContext: z
    .string()
    .optional()
    .describe('Optional context such as the room type or current style.'),
});

export type SceneMoodAnalysisInput = z.infer<typeof sceneMoodAnalysisInputSchema>;

export interface SceneMoodAnalysisOutput {
  score: number;
  label: string;
  summary: string;
  recommendations: string[];
  sceneUpdate: {
    lightingMood?: 'cozy' | 'bright' | 'dramatic' | 'neutral';
    wallColor?: string;
    floorMaterial?: 'wood' | 'tile' | 'carpet';
  };
}

function inferSceneUpdate(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes('cozy') || normalized.includes('warm') || normalized.includes('cabin')) {
    return {
      lightingMood: 'cozy' as const,
      wallColor: '#e6c9a8',
      floorMaterial: 'wood' as const,
    };
  }

  if (normalized.includes('bright') || normalized.includes('airy') || normalized.includes('minimal')) {
    return {
      lightingMood: 'bright' as const,
      wallColor: '#f5f5f5',
      floorMaterial: 'tile' as const,
    };
  }

  if (normalized.includes('dramatic') || normalized.includes('dark') || normalized.includes('moody')) {
    return {
      lightingMood: 'dramatic' as const,
      wallColor: '#3a3f4b',
      floorMaterial: 'carpet' as const,
    };
  }

  return {
    lightingMood: 'neutral' as const,
    wallColor: '#e8e1d5',
    floorMaterial: 'wood' as const,
  };
}

export const sceneMoodAnalysisTool = {
  description:
    'Analyze a restyle request and return a structured mood score, summary, recommendations, and scene update.',
  inputSchema: sceneMoodAnalysisInputSchema,
  execute: async ({ prompt, roomContext }: SceneMoodAnalysisInput): Promise<SceneMoodAnalysisOutput> => {
    const normalized = prompt.toLowerCase();
    const sceneUpdate = inferSceneUpdate(prompt);

    let score = 72;
    let label = 'Balanced direction';

    if (normalized.includes('cozy') || normalized.includes('warm')) {
      score = 88;
      label = 'Strong cozy signal';
    } else if (normalized.includes('bright') || normalized.includes('airy')) {
      score = 86;
      label = 'Strong bright signal';
    } else if (normalized.includes('dramatic') || normalized.includes('dark')) {
      score = 84;
      label = 'Strong dramatic signal';
    } else if (normalized.includes('neutral') || normalized.includes('simple')) {
      score = 74;
      label = 'Keep it calm';
    }

    const recommendations = [
      'Use the suggested palette to anchor the room mood.',
      'Highlight one focal surface so the update feels intentional.',
      roomContext ? `Blend the restyle with ${roomContext}.` : 'Keep the restyle consistent across materials and lighting.',
    ];

    return {
      score,
      label,
      summary: `The request points toward ${sceneUpdate.lightingMood ?? 'neutral'} styling with a clear visual direction.`,
      recommendations,
      sceneUpdate,
    };
  },
};
