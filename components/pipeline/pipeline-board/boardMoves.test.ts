import { describe, expect, it } from 'vitest';
import type { ClientRect, CollisionDetection } from '@dnd-kit/core';
import type { StageUI } from '@/lib/helper/transformPipeline';
import { columnCollision, dropIndex, moveDealToColumn, stageNameAt } from './boardMoves';

// Each column says it has more deals than are loaded, as on the real board.
const stage = (name: string, deals: Array<[string, number]>, count = 50, value = 9000): StageUI => ({
  id: name,
  name,
  value,
  count,
  nextCursor: 'cursor',
  deals: deals.map(([id, amount]) => ({ id, amount }) as StageUI['deals'][number]),
});

const board = () => [
  stage('Prospect', [['p1', 100], ['p2', 200]]),
  stage('Qualified', [['q1', 300]], 7, 2000),
  stage('Closed - Won', []),
];

const idsIn = (stages: StageUI[], name: string) => stages.find((s) => s.name === name)!.deals.map((d) => d.id);

describe('stageNameAt (where a dragged card is)', () => {
  it('reads a column drop zone', () => {
    expect(stageNameAt(board(), 'column-Closed - Won')).toBe('Closed - Won');
  });

  it("reads the column of the card it is over", () => {
    expect(stageNameAt(board(), 'q1')).toBe('Qualified');
  });

  it('is null outside the board', () => {
    expect(stageNameAt(board(), 'something-else')).toBeNull();
  });
});

describe('moveDealToColumn', () => {
  it('moves the card, and its count and amount with it', () => {
    const moved = moveDealToColumn(board(), 'p2', 'Qualified');

    expect(idsIn(moved, 'Prospect')).toEqual(['p1']);
    expect(idsIn(moved, 'Qualified')).toEqual(['q1', 'p2']);
    expect(moved[0]).toMatchObject({ count: 49, value: 8800 });
    expect(moved[1]).toMatchObject({ count: 8, value: 2200 });
  });

  it('puts the card where it was dropped', () => {
    expect(idsIn(moveDealToColumn(board(), 'p1', 'Qualified', 0), 'Qualified')).toEqual(['p1', 'q1']);
  });

  it('changes nothing within its own column - the order is the API sort', () => {
    const stages = board();
    expect(moveDealToColumn(stages, 'p2', 'Prospect')).toBe(stages);
  });

  it('changes nothing for an unknown card or column', () => {
    const stages = board();
    expect(moveDealToColumn(stages, 'nope', 'Qualified')).toBe(stages);
    expect(moveDealToColumn(stages, 'p1', 'Nope')).toBe(stages);
  });
});

describe('columnCollision (which column takes the drop)', () => {
  const rect = (left: number, top: number, width: number, height: number): ClientRect => ({
    left, top, width, height, right: left + width, bottom: top + height,
  });

  // Two 320px columns, 900px tall (the board's tallest). Qualified has one
  // card at its top; the rest of its height is empty.
  const rects = new Map<string, ClientRect>([
    ['column-Prospect', rect(0, 0, 320, 900)],
    ['column-Qualified', rect(344, 0, 320, 900)],
    ['q1', rect(360, 60, 288, 120)],
    ['p1', rect(16, 60, 288, 120)],
  ]);

  const hit = (pointer: { x: number; y: number } | null, overlay = rect(pointer?.x ?? 0, pointer?.y ?? 0, 288, 120)) =>
    columnCollision({
      active: { id: 'p1' },
      collisionRect: overlay,
      droppableRects: rects,
      droppableContainers: [...rects.keys()].map((id) => ({ id })),
      pointerCoordinates: pointer,
    } as unknown as Parameters<CollisionDetection>[0]).map((c) => c.id);

  it('takes the column under the pointer, never a card', () => {
    expect(hit({ x: 400, y: 100 })).toEqual(['column-Qualified']); // over card q1
  });

  it('goes by the pointer, not by where most of the dragged card is', () => {
    // Held by its right edge: the card mostly covers Prospect, the pointer is in Qualified.
    expect(hit({ x: 360, y: 400 }, rect(100, 400, 288, 120))).toEqual(['column-Qualified']);
  });

  it('takes a short column anywhere along its height, far below its last card', () => {
    expect(hit({ x: 400, y: 850 })).toEqual(['column-Qualified']);
  });

  it('falls back to the column the dragged card overlaps when the pointer is between columns', () => {
    expect(hit({ x: 330, y: 400 }, rect(340, 400, 288, 120))).toEqual(['column-Qualified']);
  });

  it('is nothing off the board', () => {
    expect(hit({ x: 2000, y: 2000 })).toEqual([]);
  });
});

describe('dropIndex (where in the column the card was dropped)', () => {
  // Three cards, 100px tall, 12px apart: middles at 50, 162, 274.
  const cardsAt = [{ top: 0, height: 100 }, { top: 112, height: 100 }, { top: 224, height: 100 }];

  it('is the top when dropped above the first card\'s middle', () => {
    expect(dropIndex(cardsAt, 20)).toBe(0);
  });

  it('is between the cards whose middles it falls between', () => {
    expect(dropIndex(cardsAt, 120)).toBe(1);
    expect(dropIndex(cardsAt, 200)).toBe(2);
  });

  it('is the end below the last card, and in an empty column', () => {
    expect(dropIndex(cardsAt, 900)).toBe(3);
    expect(dropIndex([], 120)).toBe(0);
  });
});
