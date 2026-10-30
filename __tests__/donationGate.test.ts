import { createDonationGate } from '../store/donationGate';

function setup() {
  const events: string[] = [];
  const gate = createDonationGate({
    setVisible: visible => events.push(`visible:${visible}`),
    markShown: () => events.push('mark'),
  });
  return { gate, events };
}

describe('donation prompt gate', () => {
  it('marks the prompt as shown before making it visible', () => {
    const { gate, events } = setup();
    const token = gate.beginExplosion();

    gate.reveal(token, true);

    expect(events).toEqual(['mark', 'visible:true']);
    expect(gate.isPending()).toBe(false);
  });

  it('ignores a reveal that is not eligible', () => {
    const { gate, events } = setup();
    const token = gate.beginExplosion();

    gate.reveal(token, false);

    expect(events).toEqual([]);
  });

  it('does not reveal a prompt after its round was invalidated', () => {
    const { gate, events } = setup();
    const token = gate.beginExplosion();
    gate.startRound();

    gate.reveal(token, true);

    expect(events).toEqual([]);
  });

  it('defers while instructions are open and shows on close', () => {
    const { gate, events } = setup();
    gate.openInstructions();
    const token = gate.beginExplosion();

    gate.reveal(token, true);
    expect(events).toEqual([]);
    expect(gate.isPending()).toBe(true);

    gate.closeInstructions();
    expect(events).toEqual(['mark', 'visible:true']);
    expect(gate.isPending()).toBe(false);
  });

  it('cancels the deferred prompt when a new round starts', () => {
    const { gate, events } = setup();
    gate.openInstructions();
    const token = gate.beginExplosion();
    gate.reveal(token, true);

    gate.startRound();
    gate.closeInstructions();

    expect(events).toEqual([]);
    expect(gate.isPending()).toBe(false);
  });

  it('hides a visible prompt when a new round starts', () => {
    const { gate, events } = setup();
    const token = gate.beginExplosion();
    gate.reveal(token, true);
    events.length = 0;

    gate.startRound();

    expect(events).toEqual(['visible:false']);
  });

  it('invalidates pending work on dispose', () => {
    const { gate, events } = setup();
    const token = gate.beginExplosion();
    gate.dispose();
    events.length = 0;

    gate.reveal(token, true);

    expect(events).toEqual([]);
  });
});
