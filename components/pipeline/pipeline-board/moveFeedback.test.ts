import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXIT_MS,
  HIGHLIGHT_MS,
  createMoveFeedback,
  moveDirection,
  moveFeedbackClass,
  type MoveFeedbackState,
} from './moveFeedback';

const cards = (...ids: string[]) => ids.map((id) => ({ id }));

describe('moveDirection (where a moved card landed after the reload)', () => {
  it('is up when the sort puts it higher than where it was dropped', () => {
    expect(moveDirection(cards('a', 'b', 'x'), cards('x', 'a', 'b'), 'x')).toBe('up');
  });

  it('is down when the sort puts it lower', () => {
    expect(moveDirection(cards('x', 'a', 'b'), cards('a', 'b', 'x'), 'x')).toBe('down');
  });

  it('is same when it stays where it was dropped', () => {
    expect(moveDirection(cards('a', 'x', 'b'), cards('a', 'x', 'b'), 'x')).toBe('same');
  });

  it('is gone when it is no longer among the loaded cards (behind Load More)', () => {
    expect(moveDirection(cards('x', 'a'), cards('a', 'b', 'c', 'd', 'e'), 'x')).toBe('gone');
  });
});

describe('moveFeedbackClass', () => {
  const fx = (phase: MoveFeedbackState['phase'], direction: MoveFeedbackState['direction']): MoveFeedbackState => ({
    dealId: 'x',
    phase,
    direction,
  });

  it('fades out toward where the card went, and stays out until the board swaps', () => {
    expect(moveFeedbackClass(fx('exiting', 'up'))).toContain('slide-out-to-top-4');
    expect(moveFeedbackClass(fx('exiting', 'down'))).toContain('slide-out-to-bottom-4');
    expect(moveFeedbackClass(fx('exiting', 'gone'))).toContain('slide-out-to-bottom-4');
    expect(moveFeedbackClass(fx('exiting', 'up'))).toContain('fill-mode-forwards');
  });

  it('fades in from the side it came from', () => {
    expect(moveFeedbackClass(fx('entering', 'up'))).toContain('slide-in-from-bottom-4');
    expect(moveFeedbackClass(fx('entering', 'down'))).toContain('slide-in-from-top-4');
  });

  it('adds nothing while saving, for a card that stayed put, or for no card', () => {
    expect(moveFeedbackClass(fx('saving', null))).toBe('');
    expect(moveFeedbackClass(fx('entering', 'same'))).toBe('');
    expect(moveFeedbackClass(null)).toBe('');
  });

  it('respects reduced motion', () => {
    expect(moveFeedbackClass(fx('exiting', 'down'))).toContain('motion-reduce:animate-none');
    expect(moveFeedbackClass(fx('entering', 'up'))).toContain('motion-reduce:animate-none');
  });
});

describe('createMoveFeedback (one moved card, step by step)', () => {
  let states: Array<MoveFeedbackState | null>;
  let feedback: ReturnType<typeof createMoveFeedback>;
  const last = () => states.at(-1);

  beforeEach(() => {
    vi.useFakeTimers();
    states = [];
    feedback = createMoveFeedback((s) => states.push(s));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saving -> fade out -> new board -> highlight -> done', () => {
    const showBoard = vi.fn();
    const run = feedback.start('x');
    expect(last()).toEqual({ dealId: 'x', phase: 'saving', direction: null });
    expect(feedback.holdsBoard()).toBe(true);

    run.finish('down', showBoard);
    expect(last()).toMatchObject({ phase: 'exiting', direction: 'down' });
    expect(feedback.holdsBoard()).toBe(true);
    expect(showBoard).not.toHaveBeenCalled();

    vi.advanceTimersByTime(EXIT_MS);
    expect(showBoard).toHaveBeenCalledTimes(1);
    expect(last()).toMatchObject({ phase: 'entering', direction: 'down' });
    expect(feedback.holdsBoard()).toBe(false);

    vi.advanceTimersByTime(HIGHLIGHT_MS);
    expect(last()).toBeNull();
  });

  it('a card that stayed put shows the new board at once, then is highlighted', () => {
    const showBoard = vi.fn();
    feedback.start('x').finish('same', showBoard);

    expect(showBoard).toHaveBeenCalledTimes(1);
    expect(last()).toMatchObject({ phase: 'entering', direction: 'same' });
    vi.advanceTimersByTime(HIGHLIGHT_MS);
    expect(last()).toBeNull();
  });

  it('a card sorted behind Load More fades out downward and ends there', () => {
    const showBoard = vi.fn();
    feedback.start('x').finish('gone', showBoard);
    expect(last()).toMatchObject({ phase: 'exiting', direction: 'gone' });

    vi.advanceTimersByTime(EXIT_MS);
    expect(showBoard).toHaveBeenCalledTimes(1);
    expect(last()).toBeNull();
    expect(feedback.holdsBoard()).toBe(false);
  });

  it('cancel (the move failed) frees the card and the board at once', () => {
    feedback.start('x').cancel();

    expect(last()).toBeNull();
    expect(feedback.holdsBoard()).toBe(false);
  });

  it('a newer move ends the older one where it is: no late board swap, no stuck card', () => {
    const firstBoard = vi.fn();
    const first = feedback.start('x');
    first.finish('up', firstBoard);

    const second = feedback.start('y');
    vi.advanceTimersByTime(EXIT_MS + HIGHLIGHT_MS);

    expect(firstBoard).not.toHaveBeenCalled();
    expect(first.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(true);
    expect(last()).toEqual({ dealId: 'y', phase: 'saving', direction: null });

    // The older move finishing or failing late changes nothing.
    first.finish('down', firstBoard);
    first.cancel();
    expect(firstBoard).not.toHaveBeenCalled();
    expect(last()).toEqual({ dealId: 'y', phase: 'saving', direction: null });
  });

  it('nothing fires after the board unmounts', () => {
    const showBoard = vi.fn();
    feedback.start('x').finish('down', showBoard);
    const seen = states.length;

    feedback.dispose();
    vi.advanceTimersByTime(EXIT_MS + HIGHLIGHT_MS);

    expect(showBoard).not.toHaveBeenCalled();
    expect(states).toHaveLength(seen);
    expect(feedback.holdsBoard()).toBe(false);
  });
});
