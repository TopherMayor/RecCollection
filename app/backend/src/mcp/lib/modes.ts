type ModeTransition = {
  from: string;
  to: string[];
};

export class ModeHandler {
  private allowedTransitions: ModeTransition[];

  constructor(config: { allowedTransitions: ModeTransition[] }) {
    this.allowedTransitions = config.allowedTransitions;
  }

  validateTransition(currentMode: string, targetMode: string): boolean {
    return this.allowedTransitions.some(
      (t) => t.from === currentMode && t.to.includes(targetMode)
    );
  }

  getAllowedTransitions(): ModeTransition[] {
    return this.allowedTransitions;
  }
}
