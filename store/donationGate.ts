export interface DonationGateHandlers {
  /** Applies the card visibility in React state. */
  setVisible: (visible: boolean) => void;
  /** Marks the prompt as shown in memory; it must happen before setVisible(true). */
  markShown: () => void;
}

/**
 * Owns the ephemeral state of the donation prompt: the current round token,
 * the deferred prompt while the instructions modal is open, and its visibility.
 * Kept outside the screen so the race-prone logic can be tested in isolation.
 */
export interface DonationGate {
  isPending: () => boolean;
  /** Invalidates any pending work and hides the card. Call when a round starts/ends. */
  startRound: () => void;
  /** Invalidates previous work and returns the token that identifies this explosion. */
  beginExplosion: () => number;
  /** Shows the card only if the round is still current and the prompt is eligible. */
  reveal: (token: number, eligible: boolean) => void;
  openInstructions: () => void;
  closeInstructions: () => void;
  dispose: () => void;
}

export function createDonationGate({ setVisible, markShown }: DonationGateHandlers): DonationGate {
  let token = 0;
  let pending = false;
  let instructionsOpen = false;
  let visible = false;

  const applyVisible = (next: boolean) => {
    if (visible === next) return;
    visible = next;
    setVisible(next);
  };

  const cancelPending = () => {
    token += 1;
    pending = false;
    applyVisible(false);
  };

  const reveal = (candidate: number, eligible: boolean) => {
    if (candidate !== token || !eligible) return;
    if (instructionsOpen) {
      pending = true;
      return;
    }

    pending = false;
    // Mark and paint in the same synchronous step: a storage write can never
    // consume the one-shot prompt without actually showing it.
    markShown();
    applyVisible(true);
  };

  return {
    isPending: () => pending,
    startRound: cancelPending,
    beginExplosion: () => {
      cancelPending();
      return token;
    },
    reveal,
    openInstructions: () => {
      instructionsOpen = true;
    },
    closeInstructions: () => {
      instructionsOpen = false;
      if (!pending) return;
      pending = false;
      reveal(token, true);
    },
    dispose: cancelPending,
  };
}
