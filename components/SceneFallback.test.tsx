import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import SceneFallback from '@/components/SceneFallback';
import { useStore } from '@/store/useStore';

describe('SceneFallback', () => {
  beforeEach(() => {
    useStore.setState({
      objects: [],
      selectedId: null,
      selectedWall: 'back',
      selectedRoom: 'room',
      roomDimensions: { length: '12', width: '14', height: '13', unit: 'ft' },
      wallColor: '#e8d9c5',
      floorMaterial: 'wood',
    });
  });

  it('renders a labelled static room preview', () => {
    render(<SceneFallback />);
    expect(screen.getByRole('img', { name: 'Static room preview' })).toBeInTheDocument();
    expect(screen.getByText(/WebGL isn't available/)).toBeInTheDocument();
  });

  it('renders each placed object as a symbol in the preview', () => {
    useStore.setState({
      objects: [
        { id: '1', type: 'sofa', position: [0, 0, 0] as [number, number, number], rotationY: 0, color: '#a33', metalness: 0, roughness: 1 },
        { id: '2', type: 'lamp', position: [0, 0, 0] as [number, number, number], rotationY: 0, color: '#3a3', metalness: 0, roughness: 1 },
      ],
    });
    render(<SceneFallback />);
    expect(screen.getByText('🛋️')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
  });
});
