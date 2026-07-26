import type { LightingMood, FloorMaterial } from '@/store/useStore';
import { z } from 'zod';

export const AI_MODEL = 'claude-3-5-sonnet-20241022';
export const AI_TEMPERATURE = 0.2;
export const AI_MAX_TOKENS = 800;

export interface SceneUpdate {
  lightingMood?: LightingMood;
  wallColor?: string;
  floorMaterial?: FloorMaterial;
}

export const LightingMoodSchema = z.enum(['cozy', 'bright', 'dramatic', 'neutral']);
export const FloorMaterialSchema = z.enum(['wood', 'tile', 'carpet']);

export const SceneUpdateSchema = z.object({
  lightingMood: LightingMoodSchema.optional(),
  wallColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Wall color must be a 6-digit hex color like #RRGGBB')
    .optional(),
  floorMaterial: FloorMaterialSchema.optional(),
});

export const SPATIALSTAGER_SYSTEM_PROMPT = `You are SpatialStager, a friendly interior-design AI assistant.
Your job is to chat naturally with the user about restyling their room, and whenever possible,
translate their request into concrete scene updates.

Rules for scene updates:
- At the END of your response (after your friendly prose), append a single JSON object on its own line.
- The JSON MUST exactly match this TypeScript shape:
  { lightingMood?: 'cozy' | 'bright' | 'dramatic' | 'neutral'; wallColor?: '#RRGGBB'; floorMaterial?: 'wood' | 'tile' | 'carpet'; }
- Do NOT invent values outside these enums. Do NOT wrap the JSON in markdown fences.
- If you cannot determine a value for a field, simply omit it from the JSON.
- Include the JSON on the LAST line of your reply, so the client can parse it easily.

Style guidance for mapping requests:
- "cozy", "warm", "cabin", "rustic" => mood: cozy, warm/cream wall colors, wood floor
- "bright", "airy", "minimal", "sunny" => mood: bright, white/light gray walls, tile floor
- "dramatic", "moody", "dark", "bold" => mood: dramatic, deep charcoal/navy walls, carpet floor
- If unsure, stay neutral. Keep your prose concise (2–4 sentences max).`;
