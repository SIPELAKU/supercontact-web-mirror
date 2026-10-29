/**
 * What the user sees after dropping a card in another column. Columns are
 * sorted by the API (probability first), so once the board reloads the card
 * can land higher or lower than where it was dropped, or below the loaded
 * cards. The card says so instead of jumping:
 *
 *   saving   -> dimmed with a spinner, from the drop until the new board is in
 *   exiting  -> fades out toward where it went (up or down)
 *   entering -> the new board is shown, the card fades in there and is
 *               highlighted for a moment
 *
 * No request is made for it and nothing scrolls: a card that went below the
 * loaded ones just fades out downward.
 */

/** Where the card went in its new column, compared with where it was dropped. */
export type MoveDirection = "up" | "down" | "same" | "gone";

export type MovePhase = "saving" | "exiting" | "entering";

export interface MoveFeedbackState {
  dealId: string;
  phase: MovePhase;
  direction: MoveDirection | null;
}

export const EXIT_MS = 200;
export const HIGHLIGHT_MS = 1500;

type WithId = { id: string };

/**
 * Compares the card's place in the column as dropped with its place after the
 * reload. "gone" = it is not among the loaded cards any more (sorted further
 * down, behind "Load more").
 */
export function moveDirection(droppedDeals: WithId[], reloadedDeals: WithId[], dealId: string): MoveDirection {
  const after = reloadedDeals.findIndex((d) => String(d.id) === dealId);
  if (after === -1) return "gone";
  const before = droppedDeals.findIndex((d) => String(d.id) === dealId);
  if (before === -1 || after === before) return "same";
  return after < before ? "up" : "down";
}

/**
 * The animation classes for a card (tw-animate-css). Static strings, so
 * Tailwind finds them. Reduced motion keeps only the highlight.
 */
export function moveFeedbackClass(state: MoveFeedbackState | null): string {
  if (!state) return "";
  if (state.phase === "exiting") {
    return state.direction === "up"
      ? "animate-out fade-out slide-out-to-top-4 duration-200 fill-mode-forwards motion-reduce:animate-none"
      : "animate-out fade-out slide-out-to-bottom-4 duration-200 fill-mode-forwards motion-reduce:animate-none";
  }
  if (state.phase === "entering") {
    // It travelled up, so it comes in from below; down, from above.
    if (state.direction === "up") return "animate-in fade-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none";
    if (state.direction === "down") return "animate-in fade-in slide-in-from-top-4 duration-200 motion-reduce:animate-none";
  }
  return "";
}

export interface MoveRun {
  /** False once a newer move took over, or the board went away. */
  isCurrent: () => boolean;
  /**
   * The board reloaded with the move: fade the card out toward `direction`,
   * then `showBoard`, then highlight the card in its new place.
   */
  finish: (direction: MoveDirection, showBoard: () => void) => void;
  /** Stop following the move (it failed, or there is no new board to show). */
  cancel: () => void;
}

/**
 * Follows one moved card at a time; a newer move ends the older one where it
 * is. Every way out (finish, cancel, a newer move, dispose) clears the timer
 * and the state, so a card can't stay dimmed or highlighted.
 */
export function createMoveFeedback(onChange: (state: MoveFeedbackState | null) => void) {
  let runId = 0;
  let state: MoveFeedbackState | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const update = (next: MoveFeedbackState | null) => {
    state = next;
    onChange(next);
  };

  const stop = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (state) update(null);
  };

  return {
    /**
     * While the card is saving or fading out, the board on screen must stay as
     * it is: the move decides when the new board is shown.
     */
    holdsBoard: () => state?.phase === "saving" || state?.phase === "exiting",

    start(dealId: string): MoveRun {
      stop();
      const id = ++runId;
      const isCurrent = () => id === runId;
      update({ dealId, phase: "saving", direction: null });

      const enter = (direction: MoveDirection, showBoard: () => void) => {
        showBoard();
        if (direction === "gone") {
          stop();
          return;
        }
        update({ dealId, phase: "entering", direction });
        timer = setTimeout(() => {
          if (isCurrent()) stop();
        }, HIGHLIGHT_MS);
      };

      return {
        isCurrent,
        finish(direction, showBoard) {
          if (!isCurrent()) return;
          if (direction === "same") {
            enter(direction, showBoard);
            return;
          }
          update({ dealId, phase: "exiting", direction });
          timer = setTimeout(() => {
            if (isCurrent()) enter(direction, showBoard);
          }, EXIT_MS);
        },
        cancel() {
          if (isCurrent()) stop();
        },
      };
    },

    /** The board is unmounting: no timer may fire afterwards. */
    dispose() {
      runId++;
      if (timer) clearTimeout(timer);
      timer = null;
      state = null;
    },
  };
}
