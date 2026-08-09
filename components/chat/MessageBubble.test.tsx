import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageBubble } from '@/components/chat/ChatPanel';
import {
  assistantFileMessage,
  assistantReasoningMessage,
  assistantSourceMessage,
  assistantTextMessage,
  assistantToolMessage,
  userMessage,
} from '@/test/fixtures/messages';

describe('MessageBubble (chat message renderer)', () => {
  it('renders a text part for the user', () => {
    render(<MessageBubble message={userMessage('Add a warm rug.')} isStreaming={false} />);
    expect(screen.getByText('Add a warm rug.')).toBeInTheDocument();
  });

  it('renders a text part for the assistant', () => {
    render(<MessageBubble message={assistantTextMessage('Try a soft lamp.')} isStreaming={false} />);
    expect(screen.getByText('Try a soft lamp.')).toBeInTheDocument();
  });

  it('renders a reasoning part under a Thinking disclosure', () => {
    render(
      <MessageBubble
        message={assistantReasoningMessage('The user wants cozy lighting.', 'Try a soft lamp.')}
        isStreaming={false}
      />,
    );
    expect(screen.getByText('Thinking')).toBeInTheDocument();
    expect(screen.getByText('The user wants cozy lighting.')).toBeInTheDocument();
    expect(screen.getByText('Try a soft lamp.')).toBeInTheDocument();
  });

  it('renders a tool invocation part through the tool card', () => {
    render(<MessageBubble message={assistantToolMessage()} isStreaming={false} />);
    expect(screen.getByText('Mood analysis')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('Strong cozy signal')).toBeInTheDocument();
    expect(screen.getByText('Here is the analysis.')).toBeInTheDocument();
  });

  it('renders a file part as a labelled link', () => {
    render(<MessageBubble message={assistantFileMessage()} isStreaming={false} />);
    expect(screen.getByRole('link', { name: /floorplan\.png/i })).toBeInTheDocument();
  });

  it('renders a source-url part as a labelled link', () => {
    render(<MessageBubble message={assistantSourceMessage()} isStreaming={false} />);
    expect(screen.getByRole('link', { name: 'Room styling guide' })).toHaveAttribute(
      'href',
      'https://example.com/article',
    );
  });

  it('shows thinking dots while a streaming assistant message has no content yet', () => {
    render(
      <MessageBubble
        message={{ id: 'assistant-empty', role: 'assistant', parts: [{ type: 'text', text: '', state: 'streaming' }] }}
        isStreaming
      />,
    );
    expect(screen.getByText('Thinking')).toBeInTheDocument();
  });
});
