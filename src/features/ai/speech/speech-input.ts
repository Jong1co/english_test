export type SpeechPermission = 'granted' | 'denied' | 'undetermined';

/** Why listening could not start or stopped by itself: no permission, no recognizer for en-US, or anything else. */
export type SpeechFailure = 'not-allowed' | 'unavailable' | 'other';

/** How listening ended when the learner didn't tap to stop. */
export type SpeechEnd = { kind: 'ended'; transcript: string } | { kind: 'failed'; failure: SpeechFailure };

export type SpeechHandlers = {
  /** The whole transcript so far, each time it changes. */
  onPartial(text: string): void;
  /** The recognizer stopped on its own (interruption, silence, error). Not called after stop() or cancel(). */
  onEnd(end: SpeechEnd): void;
};

export class SpeechStartError extends Error {
  readonly failure: SpeechFailure;

  constructor(failure: SpeechFailure, message: string) {
    super(message);
    this.name = 'SpeechStartError';
    this.failure = failure;
  }
}

/**
 * Speech to text for one answer at a time. iOS's on-device recognizer today; anything else
 * (SpeechAnalyzer, a local Whisper) can replace it behind this type.
 */
export type SpeechInput = {
  /** Whether recognition can run on this device without the network. */
  available(): Promise<boolean>;
  permission(): Promise<SpeechPermission>;
  requestPermission(): Promise<SpeechPermission>;
  /** Sets up audio once per practice, so reading aloud and listening behave the same for every question. */
  prepare(): Promise<void>;
  /** Resolves once listening has started; rejects with SpeechStartError if it can't. */
  start(handlers: SpeechHandlers): Promise<void>;
  /** Stops listening and resolves with the final transcript, '' if nothing was heard. Never rejects. */
  stop(): Promise<string>;
  /** Stops listening and drops the transcript. Safe to call at any time. */
  cancel(): void;
};
