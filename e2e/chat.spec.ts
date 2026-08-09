import { expect, test } from '@playwright/test';

const UI_STREAM_CHUNKS = [
  { type: 'start', messageId: 'mock-msg-1' },
  { type: 'text-start', id: 'mock-part-0' },
  { type: 'text-delta', id: 'mock-part-0', delta: 'Hello from the ' },
  { type: 'text-delta', id: 'mock-part-0', delta: 'mocked assistant.' },
  { type: 'text-end', id: 'mock-part-0' },
  { type: 'finish', finishReason: 'stop' },
];

test('primary flow: open chat, send a message, receive an answer', async ({ page }) => {
  await page.route('**/api/scene-chat', async (route) => {
    const body = UI_STREAM_CHUNKS.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('');
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body,
    });
  });

  await page.goto('/');

  await page.getByRole('button', { name: 'Toggle chat panel' }).click();
  const input = page.getByRole('textbox', { name: 'Chat message' });
  await input.fill('Make my room cozy');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText('Make my room cozy')).toBeVisible();
  await expect(page.getByText(/mocked assistant/i)).toBeVisible();
});
