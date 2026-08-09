import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ToolCard from '@/components/chat/ToolCard';
import type { SceneMoodAnalysisOutput } from '@/lib/tools/sceneMoodAnalysis';

const output: SceneMoodAnalysisOutput = {
  score: 88,
  label: 'Strong cozy signal',
  summary: 'The request points toward cozy styling with a clear visual direction.',
  recommendations: ['Use the suggested palette to anchor the room mood.', 'Highlight one focal surface.'],
  sceneUpdate: { lightingMood: 'cozy' },
};

describe('ToolCard (tool-result component)', () => {
  it('renders the structured output once a tool finishes', () => {
    render(<ToolCard title="Mood analysis" state="output-available" output={output} />);

    expect(screen.getByText('Mood analysis')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('Strong cozy signal')).toBeInTheDocument();
    expect(screen.getByText('The request points toward cozy styling with a clear visual direction.')).toBeInTheDocument();
    expect(screen.getByText('Use the suggested palette to anchor the room mood.')).toBeInTheDocument();
    expect(screen.getByText('Highlight one focal surface.')).toBeInTheDocument();
  });

  it('renders the failure message when a tool errors', () => {
    render(<ToolCard title="Mood analysis" state="output-error" errorText="Provider returned 429" />);

    expect(screen.getByText('Tool execution failed')).toBeInTheDocument();
    expect(screen.getByText('Provider returned 429')).toBeInTheDocument();
  });

  it('renders the busy state while the input is available', () => {
    render(<ToolCard title="Mood analysis" state="input-available" input={{ prompt: 'Make it cozy' }} />);

    expect(screen.getByText('Preparing the analysis request.')).toBeInTheDocument();
    expect(screen.getByText('Tool input is ready')).toBeInTheDocument();
  });

  it('renders streamed tool input while it is being generated', () => {
    render(<ToolCard title="Mood analysis" state="input-streaming" input={{ prompt: 'Make it' }} />);

    expect(screen.getByText('Streaming tool input')).toBeInTheDocument();
    expect(screen.queryByText('A structured result is ready to review.')).not.toBeInTheDocument();
  });

  it('labels the state badge on every variant', () => {
    render(<ToolCard title="Mood analysis" state="output-denied" input={{ prompt: 'x' }} />);

    expect(screen.getByText('output denied')).toBeInTheDocument();
  });
});
