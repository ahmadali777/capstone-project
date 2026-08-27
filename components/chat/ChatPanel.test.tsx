import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatPanel from '@/components/chat/ChatPanel';
import { userMessage } from '@/test/fixtures/messages';

const { useChatMock } = vi.hoisted(() => ({ useChatMock: vi.fn() }));

vi.mock('@ai-sdk/react', () => ({
  useChat: useChatMock,
}));

vi.mock('@/store/useStore', () => ({
  useStore: Object.assign(
    vi.fn(() => ({
      selectedRoom: 'living-room',
      roomDimensions: { length: '6', width: '4.5', height: '3', unit: 'ft' },
      wallColor: '#e8e1d5',
      floorMaterial: 'wood',
      lightingMood: 'neutral',
      objects: [{ type: 'sofa' }, { type: 'table' }],
    })),
    {
      getState: vi.fn(() => ({
        selectedRoom: 'living-room',
        roomDimensions: { length: '6', width: '4.5', height: '3', unit: 'ft' },
        wallColor: '#e8e1d5',
        floorMaterial: 'wood',
        lightingMood: 'neutral',
        objects: [{ type: 'sofa' }, { type: 'table' }],
      })),
    },
  ),
}));

const mockGetRemainingMessages = vi.fn(() => 2);
const mockDecrementMessages = vi.fn(() => 1);

vi.mock('@/lib/chatRateLimit', () => ({
  getRemainingMessages: () => mockGetRemainingMessages(),
  decrementMessages: () => mockDecrementMessages(),
}));

type MockStatus = 'ready' | 'submitted' | 'streaming' | 'error';

interface MockChat {
  status: MockStatus;
  messages: ReturnType<typeof userMessage>[];
  error?: Error;
  sendMessage: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onError?: (error: Error) => void;
}

function createMockChat(initial: Partial<MockChat> = {}) {
  const state: MockChat = {
    status: 'ready',
    messages: [],
    sendMessage: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    ...initial,
  };

  useChatMock.mockImplementation((options?: { onError?: (error: Error) => void }) => {
    state.onError = options?.onError;
    return {
      get messages() {
        return state.messages;
      },
      get status() {
        return state.status;
      },
      get error() {
        return state.error;
      },
      sendMessage: state.sendMessage,
      stop: state.stop,
    };
  });

  return state;
}

describe('ChatPanel', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => true,
    });
    mockGetRemainingMessages.mockReturnValue(2);
    mockDecrementMessages.mockReturnValue(1);
  });

  afterEach(() => {
    useChatMock.mockReset();
  });

  it('sends a message when the form is submitted', async () => {
    const state = createMockChat();
    const user = userEvent.setup();

    render(<ChatPanel />);

    const input = screen.getByRole('textbox', { name: 'Chat message' });
    await user.type(input, 'Make my room cozy');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(state.sendMessage).toHaveBeenCalledWith({ text: 'Make my room cozy' });
    expect(input).toHaveValue('');
  });

  it('keeps the send button disabled until there is input', async () => {
    createMockChat();
    const user = userEvent.setup();

    render(<ChatPanel />);

    const sendButton = screen.getByRole('button', { name: 'Send message' });
    expect(sendButton).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: 'Chat message' }), 'hello');
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled();
  });

  it('shows the pending state with a stop control while waiting for a reply', () => {
    createMockChat({
      status: 'submitted',
      messages: [userMessage('hello')],
    });

    render(<ChatPanel />);

    expect(screen.getByRole('button', { name: 'Stop generating response' })).toBeInTheDocument();
    expect(screen.getByText('Generating response. Activate the button to stop.')).toBeInTheDocument();
  });

  it('renders streamed assistant content while streaming', () => {
    createMockChat({
      status: 'streaming',
      messages: [
        userMessage('hello'),
        { id: 'assistant-1', role: 'assistant', parts: [{ type: 'text', text: 'Try a soft lamp.', state: 'streaming' }] },
      ],
    });

    render(<ChatPanel />);

    expect(screen.getByText('Try a soft lamp.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop generating response' })).toBeInTheDocument();
  });

  it('stops the stream and shows the interrupted banner when Stop is pressed', async () => {
    const state = createMockChat({
      status: 'streaming',
      messages: [
        userMessage('hello'),
        { id: 'assistant-1', role: 'assistant', parts: [{ type: 'text', text: 'Partial', state: 'streaming' }] },
      ],
    });
    const user = userEvent.setup();

    render(<ChatPanel />);

    await user.click(screen.getByRole('button', { name: 'Stop generating response' }));

    expect(state.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Stream interrupted')).toBeInTheDocument();
  });

  it('shows the error banner when the chat fails', async () => {
    const state = createMockChat();
    const user = userEvent.setup();
    const { rerender } = render(<ChatPanel />);

    state.status = 'error';
    state.error = new Error('network down');
    rerender(<ChatPanel />);

    expect(await screen.findByText('Connection issue')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Chat message' }), 'hello');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    state.onError?.(new Error('network down'));
    rerender(<ChatPanel />);

    expect(await screen.findByText('Connection issue')).toBeInTheDocument();
    expect(state.sendMessage).toHaveBeenCalledWith({ text: 'hello' });
  });

  it('retries the last prompt from the error banner', async () => {
    const state = createMockChat();
    const user = userEvent.setup();
    const { rerender } = render(<ChatPanel />);

    await user.type(screen.getByRole('textbox', { name: 'Chat message' }), 'hello');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    state.status = 'error';
    state.error = new Error('network down');
    state.onError?.(new Error('network down'));
    rerender(<ChatPanel />);

    await user.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(state.sendMessage).toHaveBeenLastCalledWith({ text: 'hello' });
    await waitFor(() => {
      expect(screen.queryByText('Connection issue')).not.toBeInTheDocument();
    });
  });

  it('shows the offline state and blocks sending', async () => {
    createMockChat();
    const user = userEvent.setup();

    render(<ChatPanel />);

    let offline = false;
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => offline,
    });

    offline = false;
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('textbox', { name: 'Chat message' }), 'hello');
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('displays the chat counter with remaining messages', () => {
    createMockChat();

    render(<ChatPanel />);

    expect(screen.getByText('Chats remaining: 2 / 2')).toBeInTheDocument();
  });

  it('disables input and shows no-credits banner when remaining is 0', () => {
    mockGetRemainingMessages.mockReturnValue(0);
    createMockChat();

    render(<ChatPanel />);

    expect(screen.getByText('Chats remaining: 0 / 2')).toBeInTheDocument();
    expect(screen.getByText('Free messages used')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Chat message' })).toBeDisabled();
  });

  it('blocks sending when no credits remain', async () => {
    mockGetRemainingMessages.mockReturnValue(0);
    const state = createMockChat();
    const user = userEvent.setup();

    render(<ChatPanel />);

    const sendButton = screen.getByRole('button', { name: 'Send message' });
    expect(sendButton).toBeDisabled();
  });

  it('enforces maxLength on the chat input', () => {
    createMockChat();

    render(<ChatPanel />);

    const input = screen.getByRole('textbox', { name: 'Chat message' });
    expect(input).toHaveAttribute('maxlength', '300');
  });

  it('shows amber warning when only 1 chat remains', () => {
    mockGetRemainingMessages.mockReturnValue(1);
    mockDecrementMessages.mockReturnValue(0);
    createMockChat();

    render(<ChatPanel />);

    expect(screen.getByText('Chats remaining: 1 / 2')).toBeInTheDocument();
  });
});
