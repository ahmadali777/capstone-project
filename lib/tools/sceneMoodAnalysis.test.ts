import { describe, expect, it } from 'vitest';
import { sceneMoodAnalysisTool } from './sceneMoodAnalysis';

describe('sceneMoodAnalysisTool', () => {
  it('detects a cozy mood request', async () => {
    const out = await sceneMoodAnalysisTool.execute({ prompt: 'Make it cozy and warm', roomContext: 'bedroom' });
    expect(out.score).toBe(88);
    expect(out.label).toBe('Strong cozy signal');
    expect(out.sceneUpdate.lightingMood).toBe('cozy');
    expect(out.sceneUpdate.floorMaterial).toBe('wood');
  });

  it('detects a bright/airy mood request', async () => {
    const out = await sceneMoodAnalysisTool.execute({ prompt: 'I want it bright and airy' });
    expect(out.score).toBe(86);
    expect(out.sceneUpdate.lightingMood).toBe('bright');
    expect(out.sceneUpdate.wallColor).toBe('#f5f5f5');
  });

  it('falls back to a neutral suggestion for an unspecified prompt', async () => {
    const out = await sceneMoodAnalysisTool.execute({ prompt: 'Anything is fine' });
    expect(out.sceneUpdate.lightingMood).toBe('neutral');
    expect(out.score).toBe(72);
  });

  it('embeds room context into a recommendation when provided', async () => {
    const out = await sceneMoodAnalysisTool.execute({ prompt: 'dark and moody', roomContext: 'a loft' });
    const rec = out.recommendations.find((r) => r.includes('loft'));
    expect(rec).toContain('Blend the restyle with a loft.');
  });
});
