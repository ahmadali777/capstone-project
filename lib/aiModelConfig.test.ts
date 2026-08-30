import { describe, expect, it } from 'vitest';
import { buildRoomAwareSystemPrompt, SPATIALSTAGER_SYSTEM_PROMPT } from './aiModelConfig';

describe('buildRoomAwareSystemPrompt', () => {
  it('returns the base prompt when no room context is provided', () => {
    expect(buildRoomAwareSystemPrompt()).toBe(SPATIALSTAGER_SYSTEM_PROMPT);
  });

  it('appends the room state to the base prompt', () => {
    const context = '12x14 ft living room with a sofa and lamp';
    const prompt = buildRoomAwareSystemPrompt(context);

    expect(prompt).toContain(SPATIALSTAGER_SYSTEM_PROMPT);
    expect(prompt).toContain('The user\'s current room state is:');
    expect(prompt).toContain(context);
  });
});
