export type TestMode = 'time' | 'words' | 'quote';

export type TimeOption = 15 | 30 | 60;
export type WordCountOption = 10 | 25 | 50 | 100;
export type CaretStyle = 'line' | 'block' | 'underline';
export type SoundType = 'off' | 'thock' | 'clicky' | 'beep';
export type ThemeName = 'slate-dark' | 'serika-dark' | 'cyberpunk' | 'matrix' | 'dracula';

export interface TestSettings {
  mode: TestMode;
  timeLimit: TimeOption;
  wordCount: WordCountOption;
  hasPunctuation: boolean;
  hasNumbers: boolean;
  sound: SoundType;
  caretStyle: CaretStyle;
  theme: ThemeName;
  smoothCaret: boolean;
}

export interface LetterState {
  char: string;
  state: 'untyped' | 'correct' | 'incorrect' | 'extra';
}

export interface WordData {
  original: string;
  typed: string;
  letters: LetterState[];
  isCompleted: boolean;
  hasError: boolean;
}

export interface WpmSample {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  testTime: number;
  charStats: {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
  };
  samples: WpmSample[];
  mode: TestMode;
  modeDetail: string;
  timestamp: number;
}
