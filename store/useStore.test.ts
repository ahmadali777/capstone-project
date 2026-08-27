import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useStore,
  type SceneObject,
  type WallSide,
  isWallItem,
  isDecorativeItem,
  exportDesign,
  importDesign,
  MOVE_STEP,
  FOOTPRINT_HALF,
  WALL_ITEM_HALF_WIDTH,
} from '@/store/useStore';

function resolveSelected(): SceneObject | undefined {
  const { selectedId, objects } = useStore.getState();
  return objects.find((o) => o.id === selectedId);
}

function addOfType(type: SceneObject['type']): SceneObject {
  useStore.getState().addObject(type);
  const obj = resolveSelected();
  expect(obj).toBeDefined();
  return obj!;
}

const EPS = 1e-9;
const ALL_WALLS: WallSide[] = ['back', 'front', 'left', 'right'];

/** Pick a wall item type that is NOT decorative (door/window/vent) per wall side. */
const STRUCTURAL = ['door', 'window', 'vent'] as const;

beforeEach(() => {
  useStore.setState({
    objects: [],
    selectedId: null,
    selectedWall: 'back',
    selectedRoom: 'room',
    roomDimensions: { length: '5', width: '4', height: '3', unit: 'ft' },
  });
});

describe('helpers', () => {
  it('classifies wall items and decorative items', () => {
    expect(isWallItem('door')).toBe(true);
    expect(isWallItem('window')).toBe(true);
    expect(isWallItem('vent')).toBe(true);
    expect(isWallItem('painting')).toBe(true);
    expect(isWallItem('sofa')).toBe(false);
    expect(isDecorativeItem('painting')).toBe(true);
    expect(isDecorativeItem('clock')).toBe(true);
    expect(isDecorativeItem('door')).toBe(false);
  });
});

describe('object id uniqueness across restores', () => {
  it('does not re-use restored wall item ids when adding a floor item', () => {
    // The app auto-restores the saved design on load while the fresh-session
    // id counter starts at 0. Without syncing, a restored vent (obj-0) shares
    // its id with the next floor item added (obj-0), making movement move the
    // wall item instead of the floor item.
    importDesign(
      JSON.stringify({
        objects: [
          { id: 'obj-0', type: 'vent', position: [0, 0, 0], rotationY: 0, color: '#b9b9b9', metalness: 0, roughness: 1, wall: 'back', wallOffset: 0, wallVerticalOffset: 0 },
        ],
      }),
    );
    const ventId = useStore.getState().objects[0].id;
    const ventStartOffset = useStore.getState().objects[0].wallOffset;

    const floor = addOfType('sofa');

    expect(floor.id).not.toBe(ventId);
    expect(new Set(useStore.getState().objects.map((o) => o.id)).size).toBe(useStore.getState().objects.length);

    const floorStartX = floor.position[0];
    useStore.getState().moveObjectByDirection(floor.id, 'right');

    const after = useStore.getState();
    const movedFloor = after.objects.find((o) => o.id === floor.id)!;
    const ventAfter = after.objects.find((o) => o.id === ventId)!;
    expect(movedFloor.position[0]).toBeCloseTo(floorStartX + MOVE_STEP);
    expect(ventAfter.wallOffset).toBe(ventStartOffset);
  });

  it('renumbers duplicate ids in stored designs so selection stays unambiguous', () => {
    importDesign(
      JSON.stringify({
        objects: [
          { id: 'obj-0', type: 'vent', position: [0, 0, 0], rotationY: 0, color: '#b9b9b9', metalness: 0, roughness: 1, wall: 'back', wallOffset: 0, wallVerticalOffset: 0 },
          { id: 'obj-0', type: 'window', position: [0, 0, 0], rotationY: 0, color: '#9db8c4', metalness: 0, roughness: 1, wall: 'back', wallOffset: 0, wallVerticalOffset: 0 },
        ],
      }),
    );
    const ids = useStore.getState().objects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('addObject — floor items', () => {
  it('adds a floor item and auto-selects it', () => {
    const sofa = addOfType('sofa');
    expect(sofa.wall).toBeUndefined();
    expect(sofa.position[1]).toBe(0);
    expect(useStore.getState().selectedId).toBe(sofa.id);
  });

  it('places floor items within their footprint inside the room', () => {
    for (let i = 0; i < 20; i++) {
      const obj = addOfType('sofa');
      const fp = FOOTPRINT_HALF.sofa;
      expect(Math.abs(obj.position[0])).toBeLessThanOrEqual(5 / 2 - fp.rx + EPS);
      expect(Math.abs(obj.position[2])).toBeLessThanOrEqual(4 / 2 - fp.rz + EPS);
    }
  });

  it('clears the wall selection when a floor item is added', () => {
    useStore.getState().setSelectedWall('left');
    addOfType('chair');
    expect(useStore.getState().selectedWall).toBeNull();
  });
});

describe('addObject — wall items on the 4 walls', () => {
  for (const wall of ALL_WALLS) {
    it(`places a door on the ${wall} wall when ${wall} is selected`, () => {
      useStore.getState().setSelectedWall(wall);
      const door = addOfType('door');
      expect(door.wall).toBe(wall);
      expect(door.position).toEqual([0, 0, 0]);
      expect(door.wallOffset).toBe(0);
      expect(useStore.getState().selectedId).toBe(door.id);
      expect(useStore.getState().selectedWall).toBeNull();
    });

    it(`places structural items (door/window/vent) on the ${wall} wall when selected`, () => {
      useStore.getState().setSelectedWall(wall);
      for (const type of STRUCTURAL) {
        const obj = addOfType(type);
        expect(obj.wall).toBe(wall);
      }
    });
  }

  it('places decorative items on the selected wall', () => {
    useStore.getState().setSelectedWall('right');
    const painting = addOfType('painting');
    expect(painting.wall).toBe('right');
  });

  it('falls back to the back wall when no wall is selected and nothing wall-item is selected', () => {
    const door = addOfType('door');
    expect(door.wall).toBe('back');
  });

  it('inherits the wall of the currently selected wall item when no wall is selected', () => {
    useStore.getState().setSelectedWall('front');
    addOfType('painting');
    const door = addOfType('door');
    expect(door.wall).toBe('front');
  });
});

describe('moveObjectByDirection — floor movement', () => {
  it('moves a floor item left/right/up/down', () => {
    const sofa = addOfType('sofa');
    const id = sofa.id;

    useStore.getState().moveObjectByDirection(id, 'right');
    let obj = resolveSelected()!;
    expect(obj.position[0]).toBeCloseTo(sofa.position[0] + MOVE_STEP);

    useStore.getState().moveObjectByDirection(id, 'left');
    obj = resolveSelected()!;
    expect(obj.position[0]).toBeCloseTo(sofa.position[0]);

    useStore.getState().moveObjectByDirection(id, 'up');
    obj = resolveSelected()!;
    expect(obj.position[2]).toBeCloseTo(sofa.position[2] - MOVE_STEP);

    useStore.getState().moveObjectByDirection(id, 'down');
    obj = resolveSelected()!;
    expect(obj.position[2]).toBeCloseTo(sofa.position[2]);
  });

  it('clamps floor items to the room bounds (never crosses walls)', () => {
    const sofa = addOfType('sofa');
    const id = sofa.id;
    const { rx, rz } = FOOTPRINT_HALF.sofa;
    const maxX = 5 / 2 - rx;
    const maxZ = 4 / 2 - rz;

    for (let i = 0; i < 100; i++) useStore.getState().moveObjectByDirection(id, 'right');
    for (let i = 0; i < 100; i++) useStore.getState().moveObjectByDirection(id, 'up');

    const obj = resolveSelected()!;
    expect(obj.position[0]).toBeCloseTo(maxX);
    expect(obj.position[2]).toBeCloseTo(-maxZ);

    for (let i = 0; i < 200; i++) useStore.getState().moveObjectByDirection(id, 'left');
    for (let i = 0; i < 200; i++) useStore.getState().moveObjectByDirection(id, 'down');

    const clamped = resolveSelected()!;
    expect(clamped.position[0]).toBeCloseTo(-maxX);
    expect(clamped.position[2]).toBeCloseTo(maxZ);
  });

  it('recomputes the effective footprint after rotating 90 degrees', () => {
    const sofa = addOfType('sofa');
    const id = sofa.id;
    useStore.getState().rotateObject(id, Math.PI / 2);
    for (let i = 0; i < 100; i++) useStore.getState().moveObjectByDirection(id, 'right');
    const obj = resolveSelected()!;
    const { rx, rz } = FOOTPRINT_HALF.sofa;
    expect(obj.position[0]).toBeCloseTo(5 / 2 - rz);
  });
});

describe('moveObjectByDirection — wall items on all 4 walls', () => {
  for (const wall of ALL_WALLS) {
    it(`moves the item left/right along the ${wall} wall and up/down vertically`, () => {
      useStore.getState().setSelectedWall(wall);
      const id = addOfType('door').id;

      useStore.getState().moveObjectByDirection(id, 'right');
      useStore.getState().moveObjectByDirection(id, 'right');
      let obj = resolveSelected()!;
      expect(obj.wallOffset).toBeCloseTo(2 * MOVE_STEP);
      expect(obj.wallVerticalOffset ?? 0).toBe(0);

      useStore.getState().moveObjectByDirection(id, 'left');
      obj = resolveSelected()!;
      expect(obj.wallOffset).toBeCloseTo(MOVE_STEP);

      useStore.getState().moveObjectByDirection(id, 'up');
      useStore.getState().moveObjectByDirection(id, 'down');
      obj = resolveSelected()!;
      expect(obj.wallOffset).toBeCloseTo(MOVE_STEP);
      expect(obj.wallVerticalOffset ?? 0).toBeCloseTo(0);

      useStore.getState().moveObjectByDirection(id, 'up');
      obj = resolveSelected()!;
      expect(obj.wallVerticalOffset ?? 0).toBeCloseTo(MOVE_STEP);

      useStore.getState().moveObjectByDirection(id, 'down');
      useStore.getState().moveObjectByDirection(id, 'down');
      obj = resolveSelected()!;
      expect(obj.wallVerticalOffset ?? 0).toBeCloseTo(-MOVE_STEP);

      expect(obj.position).toEqual([0, 0, 0]);
    });

    it(`clamps horizontal movement to the ${wall} wall length`, () => {
      useStore.getState().setSelectedWall(wall);
      const id = addOfType('door').id;
      const wallLen = wall === 'left' || wall === 'right' ? 4 / 2 : 5 / 2;
      const margin = WALL_ITEM_HALF_WIDTH.door;
      for (let i = 0; i < 200; i++) useStore.getState().moveObjectByDirection(id, 'right');
      let obj = resolveSelected()!;
      expect(obj.wallOffset).toBeCloseTo(wallLen - margin);

      for (let i = 0; i < 400; i++) useStore.getState().moveObjectByDirection(id, 'left');
      obj = resolveSelected()!;
      expect(obj.wallOffset).toBeCloseTo(-(wallLen - margin));
    });
  }

  it('clamps vertical movement to ±1.0 on walls', () => {
    useStore.getState().setSelectedWall('back');
    const id = addOfType('window').id;
    for (let i = 0; i < 200; i++) useStore.getState().moveObjectByDirection(id, 'up');
    expect(resolveSelected()!.wallVerticalOffset).toBeCloseTo(1.0);
    for (let i = 0; i < 400; i++) useStore.getState().moveObjectByDirection(id, 'down');
    expect(resolveSelected()!.wallVerticalOffset).toBeCloseTo(-1.0);
  });

  it('keeps wallOffset and wallVerticalOffset separate per item', () => {
    useStore.getState().setSelectedWall('back');
    const doorId = addOfType('door').id;
    const windowId = addOfType('window').id;

    useStore.getState().moveObjectByDirection(doorId, 'up');
    useStore.getState().moveObjectByDirection(doorId, 'right');
    const door = useStore.getState().objects.find((o) => o.id === doorId)!;
    const window = useStore.getState().objects.find((o) => o.id === windowId)!;
    expect(window.wallOffset).toBe(0);
    expect(window.wallVerticalOffset).toBeUndefined();
    expect(door.wallOffset).toBeCloseTo(MOVE_STEP);
    expect(door.wallVerticalOffset).toBeCloseTo(MOVE_STEP);
  });

  it('moves vent horizontally while keeping its small margin', () => {
    useStore.getState().setSelectedWall('left');
    const id = addOfType('vent').id;
    for (let i = 0; i < 100; i++) useStore.getState().moveObjectByDirection(id, 'left');
    const obj = resolveSelected()!;
    const wallLen = 4 / 2;
    const margin = WALL_ITEM_HALF_WIDTH.vent;
    expect(obj.wallOffset).toBeCloseTo(-(wallLen - margin));
  });
});

describe('rotate — floor vs wall', () => {
  it('rotates a floor item via rotationY', () => {
    const sofa = addOfType('sofa');
    useStore.getState().rotateObject(sofa.id, Math.PI / 2);
    expect(resolveSelected()!.rotationY).toBeCloseTo(Math.PI / 2);
  });

  it('rotates a wall item via rotationZ (orientation on the wall)', () => {
    useStore.getState().setSelectedWall('front');
    const id = addOfType('clock').id;
    useStore.getState().setObjectRotationZ(id, Math.PI / 2);
    const obj = resolveSelected()!;
    expect(obj.rotationZ).toBeCloseTo(Math.PI / 2);
    expect(obj.wall).toBe('front');

    useStore.getState().setObjectRotationZ(id, 0);
    expect(resolveSelected()!.rotationZ).toBeCloseTo(0);
  });

  it('leaves wall offsets untouched when rotating', () => {
    useStore.getState().setSelectedWall('back');
    const id = addOfType('window').id;
    useStore.getState().moveObjectByDirection(id, 'right');
    useStore.getState().moveObjectByDirection(id, 'up');
    useStore.getState().setObjectRotationZ(id, Math.PI / 2);
    const obj = resolveSelected()!;
    expect(obj.wallOffset).toBeCloseTo(MOVE_STEP);
    expect(obj.wallVerticalOffset).toBeCloseTo(MOVE_STEP);
    expect(obj.rotationZ).toBeCloseTo(Math.PI / 2);
  });
});

describe('selection exclusivity', () => {
  it('selecting an item clears the wall selection', () => {
    useStore.getState().setSelectedWall('back');
    const sofa = addOfType('sofa');
    useStore.getState().selectObject(sofa.id);
    expect(useStore.getState().selectedId).toBe(sofa.id);
    expect(useStore.getState().selectedWall).toBeNull();
  });

  it('selecting a wall clears the item selection', () => {
    const sofa = addOfType('sofa');
    useStore.getState().setSelectedWall('right');
    expect(useStore.getState().selectedWall).toBe('right');
    expect(useStore.getState().selectedId).toBeNull();

    useStore.getState().selectObject(sofa.id);
    useStore.getState().setSelectedWall(null);
    expect(useStore.getState().selectedId).toBe(sofa.id);
    expect(useStore.getState().selectedWall).toBeNull();
  });

  it('deselecting clears both', () => {
    const sofa = addOfType('sofa');
    useStore.getState().selectObject(null);
    expect(useStore.getState().selectedId).toBeNull();
    expect(useStore.getState().selectedWall).toBeNull();
    expect(useStore.getState().objects.find((o) => o.id === sofa.id)).toBeDefined();
  });
});

describe('removeObject', () => {
  it('removes the selected item and clears the selection', () => {
    const sofa = addOfType('sofa');
    useStore.getState().removeObject(sofa.id);
    expect(useStore.getState().objects).toHaveLength(0);
    expect(useStore.getState().selectedId).toBeNull();
  });

  it('keeps an unrelated selection when deleting another item', () => {
    const sofa = addOfType('sofa');
    useStore.getState().addObject('table');
    const table = resolveSelected()!;
    useStore.getState().removeObject(sofa.id);
    expect(useStore.getState().objects).toHaveLength(1);
    expect(useStore.getState().selectedId).toBe(table.id);
  });
});

describe('moveObject — clamped floor placement', () => {
  it('clamps a floor item to the room bounds', () => {
    const sofa = addOfType('sofa');
    useStore.getState().moveObject(sofa.id, [100, 0, 100]);
    const obj = resolveSelected()!;
    const { rx, rz } = FOOTPRINT_HALF.sofa;
    expect(obj.position[0]).toBeCloseTo(5 / 2 - rx);
    expect(obj.position[2]).toBeCloseTo(4 / 2 - rz);
    expect(obj.position[1]).toBe(0);
  });

  it('drops negative y to the floor', () => {
    const sofa = addOfType('sofa');
    useStore.getState().moveObject(sofa.id, [0, -5, 0]);
    expect(resolveSelected()!.position[1]).toBe(0);
  });
});

describe('moveToWall / moveToFloor', () => {
  it('moveToWall assigns the wall and resets offsets', () => {
    const sofa = addOfType('sofa');
    useStore.getState().moveToWall(sofa.id, 'left');
    const obj = resolveSelected()!;
    expect(obj.wall).toBe('left');
    expect(obj.wallOffset).toBe(0);
    expect(obj.wallVerticalOffset).toBe(0);
    expect(obj.position).toEqual([0, 0, 0]);
  });

  it('moveToFloor returns an item to the floor and clears wall state', () => {
    useStore.getState().setSelectedWall('front');
    const id = addOfType('door').id;
    useStore.getState().moveToFloor(id);
    const obj = resolveSelected()!;
    expect(obj.wall).toBeUndefined();
    expect(obj.wallOffset).toBeUndefined();
    expect(obj.wallVerticalOffset).toBeUndefined();
    expect(obj.position).toEqual([0, 0, 0]);
  });
});

describe('resetLayout', () => {
  it('restores the starter layout and clears the selection', () => {
    addOfType('sofa');
    addOfType('door');
    useStore.getState().resetLayout();
    const { objects, selectedId } = useStore.getState();
    expect(objects.map((o) => o.id)).toEqual(['starter-sofa', 'starter-rug', 'starter-table', 'starter-plant']);
    expect(selectedId).toBeNull();
  });
});

describe('export / import design', () => {
  it('round-trips objects and room settings', () => {
    useStore.getState().setSelectedWall('left');
    addOfType('door');
    useStore.getState().moveObjectByDirection(resolveSelected()!.id, 'up');
    useStore.getState().addObject('sofa');

    const json = exportDesign();
    const restored = JSON.parse(json) as {
      objects: SceneObject[];
      roomDimensions: { length: string };
      wallColor: string;
    };
    expect(restored.objects.some((o) => o.type === 'door' && o.wall === 'left')).toBe(true);
    expect(restored.objects.some((o) => o.type === 'sofa')).toBe(true);
    expect(restored.roomDimensions.length).toBe('5');

    useStore.getState().resetLayout();
    importDesign(json);
    const { objects, selectedId } = useStore.getState();
    expect(selectedId).toBeNull();
    expect(objects).toHaveLength(2);
    expect(objects.find((o) => o.type === 'door')?.wall).toBe('left');
  });

  it('shows an alert on invalid JSON', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    importDesign('not json {');
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});