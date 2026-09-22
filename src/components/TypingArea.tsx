'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, AlertCircle, Gauge, Target, Clock } from 'lucide-react';
import { TestSettings, TestResult, WpmSample } from '../types/typing';
import { generateWords, getRandomQuote } from '../utils/words';
import { soundEngine } from '../utils/audio';

interface TypingAreaProps {
  settings: TestSettings;
  onComplete: (result: TestResult) => void;
  onTestStart: () => void;
  onRestart: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  settings,
  onComplete,
  onTestStart,
  onRestart,
}) => {
  // Word state
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  // Precise timing & live metrics
  const startTimeRef = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeLimit);
  const [liveElapsed, setLiveElapsed] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(0);
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100);
  const [liveErrors, setLiveErrors] = useState<number>(0);
  const [wpmSamples, setWpmSamples] = useState<WpmSample[]>([]);
  const samplesRef = useRef<WpmSample[]>([]);

  // Focus & Caret DOM refs
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);

  // Line scroll offset (via translateY for lockstep smoothness)
  const [lineScrollY, setLineScrollY] = useState(0);

  // Caret coordinates relative to wordsContainerRef
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 9,
    width: 2.5,
    height: 30
  });

  const [isFocused, setIsFocused] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize test words
  const initTestWords = useCallback(() => {
    let wordList: string[] = [];
    if (settings.mode === 'quote') {
      wordList = getRandomQuote();
    } else if (settings.mode === 'words') {
      wordList = generateWords({
        count: settings.wordCount,
        hasPunctuation: settings.hasPunctuation,
        hasNumbers: settings.hasNumbers,
      });
    } else {
      // Time mode: ample stream
      wordList = generateWords({
        count: 180,
        hasPunctuation: settings.hasPunctuation,
        hasNumbers: settings.hasNumbers,
      });
    }
    setWords(wordList);
    setCurrentWordIndex(0);
    setTypedHistory([]);
    setCurrentInput('');
    startTimeRef.current = null;
    setTimeLeft(settings.timeLimit);
    setLiveElapsed(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setLiveErrors(0);
    setLineScrollY(0);
    setWpmSamples([]);
    samplesRef.current = [];
    setHasStarted(false);
  }, [settings.mode, settings.timeLimit, settings.wordCount, settings.hasPunctuation, settings.hasNumbers]);

  useEffect(() => {
    initTestWords();
  }, [initTestWords]);

  // Handle focus
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, words]);

  // Pixel-perfect caret & line-scroll calculator
  const updateCaretAndScroll = useCallback(() => {
    if (!wordsContainerRef.current) return;

    const wordEl = activeWordRef.current;
    if (!wordEl) return;

    const containerRect = wordsContainerRef.current.getBoundingClientRect();
    const letterEls = wordEl.querySelectorAll('.letter');
    const inputLen = currentInput.length;

    const targetHeight = 30; // Matches cap height of text-2xl/3xl font
    let targetLeft = 0;
    let targetTop = 0;
    let targetWidth = 2.5;

    if (inputLen === 0) {
      // Before first letter of current word
      if (letterEls.length > 0) {
        const firstLetterRect = letterEls[0].getBoundingClientRect();
        targetLeft = firstLetterRect.left - containerRect.left;
        targetTop = firstLetterRect.top - containerRect.top + (firstLetterRect.height - targetHeight) / 2;
        if (settings.caretStyle === 'block') {
          targetWidth = firstLetterRect.width;
        }
      } else {
        const wordRect = wordEl.getBoundingClientRect();
        targetLeft = wordRect.left - containerRect.left;
        targetTop = wordRect.top - containerRect.top + (wordRect.height - targetHeight) / 2;
      }
    } else if (inputLen < letterEls.length) {
      // Flush before NEXT letter
      const nextLetterRect = letterEls[inputLen].getBoundingClientRect();
      targetLeft = nextLetterRect.left - containerRect.left;
      targetTop = nextLetterRect.top - containerRect.top + (nextLetterRect.height - targetHeight) / 2;

      if (settings.caretStyle === 'block') {
        targetWidth = nextLetterRect.width;
      }
    } else if (inputLen === letterEls.length) {
      // Flush after last original letter
      const lastLetterRect = letterEls[letterEls.length - 1].getBoundingClientRect();
      targetLeft = lastLetterRect.right - containerRect.left;
      targetTop = lastLetterRect.top - containerRect.top + (lastLetterRect.height - targetHeight) / 2;
      if (settings.caretStyle === 'block') {
        targetWidth = 14;
      }
    } else {
      // After extra letters
      const extraEls = wordEl.querySelectorAll('.letter-extra');
      if (extraEls.length > 0) {
        const lastExtraRect = extraEls[extraEls.length - 1].getBoundingClientRect();
        targetLeft = lastExtraRect.right - containerRect.left;
        targetTop = lastExtraRect.top - containerRect.top + (lastExtraRect.height - targetHeight) / 2;
        if (settings.caretStyle === 'block') {
          targetWidth = 14;
        }
      }
    }

    setCaretPos({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      width: targetWidth,
      height: targetHeight
    });

    // Authentic Monkeytype line shift:
    // With line-height: 48px, line 1 is y ≈ 0-48, line 2 is y ≈ 48-96, line 3 is y ≈ 96-144
    // When the active word is on line 3 or below (targetTop >= 90), shift container up by line-height!
    const lineHeight = 48;
    if (targetTop >= 90) {
      const lineIndex = Math.floor(targetTop / lineHeight);
      const newScroll = (lineIndex - 1) * lineHeight;
      setLineScrollY(newScroll);
    } else if (targetTop < 45) {
      setLineScrollY(0);
    }
  }, [currentInput, settings.caretStyle]);

  useEffect(() => {
    updateCaretAndScroll();
    window.addEventListener('resize', updateCaretAndScroll);
    return () => window.removeEventListener('resize', updateCaretAndScroll);
  }, [updateCaretAndScroll, currentInput, currentWordIndex]);

  // Compute character stats accurately
  const getCharStats = useCallback(() => {
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    typedHistory.forEach((typed, idx) => {
      const orig = words[idx] || '';
      for (let i = 0; i < orig.length; i++) {
        if (i < typed.length) {
          if (typed[i] === orig[i]) {
            correctChars++;
          } else {
            incorrectChars++;
          }
        } else {
          missedChars++;
        }
      }
      if (typed.length > orig.length) {
        extraChars += typed.length - orig.length;
      }
      if (typed === orig) {
        correctChars++; // Space
      } else {
        incorrectChars++;
      }
    });

    const currentOrig = words[currentWordIndex] || '';
    for (let i = 0; i < currentInput.length; i++) {
      if (i < currentOrig.length) {
        if (currentInput[i] === currentOrig[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      } else {
        extraChars++;
      }
    }

    return {
      correct: correctChars,
      incorrect: incorrectChars,
      extra: extraChars,
      missed: missedChars
    };
  }, [typedHistory, words, currentWordIndex, currentInput]);

  // Calculate metrics based on exact elapsed seconds
  const calculateMetrics = useCallback((elapsedSec: number) => {
    const chars = getCharStats();
    const totalTyped = chars.correct + chars.incorrect + chars.extra;
    const errors = chars.incorrect + chars.extra;

    const accuracy = totalTyped > 0 ? Math.round((chars.correct / totalTyped) * 100) : 100;

    // Prevent spikes during the first second
    if (elapsedSec < 1.0) {
      return {
        wpm: 0,
        rawWpm: 0,
        accuracy,
        errors,
        charStats: chars
      };
    }

    const timeMinutes = elapsedSec / 60;
    const wpm = Math.max(0, Math.round((chars.correct / 5) / timeMinutes));
    const rawWpm = Math.max(0, Math.round((totalTyped / 5) / timeMinutes));

    return {
      wpm,
      rawWpm,
      accuracy,
      errors,
      charStats: chars
    };
  }, [getCharStats]);

  // Finish test callback
  const finishTest = useCallback((finalDurationSec: number) => {
    const safeDuration = Math.max(1, finalDurationSec);
    const metrics = calculateMetrics(safeDuration);

    let consistency = 100;
    const samples = samplesRef.current;
    if (samples.length > 2) {
      const wpms = samples.map(s => s.wpm);
      const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 100)));
    }

    const modeDetail = settings.mode === 'time' 
      ? `${settings.timeLimit}s` 
      : settings.mode === 'words' 
        ? `${settings.wordCount} words` 
        : 'quote';

    onComplete({
      wpm: metrics.wpm,
      rawWpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      consistency,
      testTime: Math.round(safeDuration * 10) / 10,
      charStats: metrics.charStats,
      samples,
      mode: settings.mode,
      modeDetail,
      timestamp: Date.now()
    });
  }, [calculateMetrics, settings.mode, settings.timeLimit, settings.wordCount, onComplete]);

  // High refresh-rate loop (every 100ms) for real-time responsiveness
  useEffect(() => {
    if (!hasStarted || !startTimeRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSec = (now - startTimeRef.current!) / 1000;
      setLiveElapsed(elapsedSec);

      const metrics = calculateMetrics(elapsedSec);
      setLiveWpm(metrics.wpm);
      setLiveAccuracy(metrics.accuracy);
      setLiveErrors(metrics.errors);

      const currentSecond = Math.floor(elapsedSec);
      if (currentSecond > 0) {
        const lastSample = samplesRef.current[samplesRef.current.length - 1];
        if (!lastSample || lastSample.second !== currentSecond) {
          const newSample: WpmSample = {
            second: currentSecond,
            wpm: metrics.wpm,
            rawWpm: metrics.rawWpm,
            errors: metrics.errors
          };
          samplesRef.current.push(newSample);
          setWpmSamples([...samplesRef.current]);
        }
      }

      if (settings.mode === 'time') {
        const remaining = Math.max(0, Math.ceil(settings.timeLimit - elapsedSec));
        setTimeLeft(remaining);

        if (elapsedSec >= settings.timeLimit) {
          clearInterval(interval);
          finishTest(settings.timeLimit);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasStarted, settings.mode, settings.timeLimit, calculateMetrics, finishTest]);

  // Keystrokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      initTestWords();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onRestart();
      initTestWords();
      return;
    }

    if (!hasStarted) {
      if (e.key.length === 1 || e.key === 'Backspace') {
        setHasStarted(true);
        startTimeRef.current = Date.now();
        onTestStart();
      }
    }

    const currentTargetWord = words[currentWordIndex] || '';

    // Space: next word
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.trim().length === 0) return;

      const isMismatch = currentInput !== currentTargetWord;
      soundEngine.playKey(settings.sound, true, isMismatch);

      const nextHistory = [...typedHistory, currentInput];
      setTypedHistory(nextHistory);
      setCurrentInput('');

      if (currentWordIndex + 1 >= words.length) {
        const finalSec = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 1;
        finishTest(finalSec);
      } else {
        setCurrentWordIndex((prev) => prev + 1);
      }
      return;
    }

    // Backspace
    if (e.key === 'Backspace') {
      if (currentInput.length === 0 && currentWordIndex > 0) {
        const prevWordTyped = typedHistory[currentWordIndex - 1];
        const prevWordTarget = words[currentWordIndex - 1];
        if (prevWordTyped !== prevWordTarget) {
          e.preventDefault();
          setCurrentWordIndex((prev) => prev - 1);
          setCurrentInput(prevWordTyped);
          setTypedHistory((prev) => prev.slice(0, -1));
          soundEngine.playKey(settings.sound, false, false);
          return;
        }
      }
      soundEngine.playKey(settings.sound, false, false);
      return;
    }

    // Standard character
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const expectedChar = currentTargetWord[currentInput.length];
      const isError = expectedChar !== undefined && e.key !== expectedChar;
      soundEngine.playKey(settings.sound, false, isError);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = calculateMetrics(elapsed);
      setLiveWpm(m.wpm);
      setLiveAccuracy(m.accuracy);
      setLiveErrors(m.errors);
    }
  };

  const timeProgressPercent = settings.mode === 'time' 
    ? ((settings.timeLimit - timeLeft) / settings.timeLimit) * 100 
    : (currentWordIndex / (words.length || 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 select-none relative my-2">
      {/* Arena Card */}
      <div className="glass-arena rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all shadow-2xl">
        {/* Glow */}
        <div 
          className="absolute -top-32 -left-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: 'var(--main-color)' }}
        />

        {/* Live HUD Dashboard Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 font-mono text-xs">
          {/* Live Speed Meter */}
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl flex items-center justify-center text-slate-900"
              style={{ backgroundColor: 'var(--main-color)' }}
            >
              <Gauge className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--sub-color)' }}>
                Speed
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {liveWpm}
                </span>
                <span className="text-[11px] text-slate-400">wpm</span>
              </div>
            </div>
          </div>

          {/* Center Timer / Progress Pill */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--main-color)' }} />
              <span className="text-sm font-bold tracking-wide text-white">
                {settings.mode === 'time' 
                  ? `${timeLeft}s remaining` 
                  : `${currentWordIndex} / ${words.length} words (${Math.round(liveElapsed)}s)`
                }
              </span>
            </div>
            <div className="w-36 sm:w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-150"
                style={{ 
                  width: `${timeProgressPercent}%`,
                  backgroundColor: 'var(--main-color)'
                }}
              />
            </div>
          </div>

          {/* Live Accuracy & Errors */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--sub-color)' }}>
                Accuracy
              </span>
              <div className="flex items-center justify-end gap-1">
                <span className="text-lg sm:text-xl font-bold text-white">
                  {liveAccuracy}%
                </span>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            <div className="text-right pl-3 border-l border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: 'var(--sub-color)' }}>
                Errors
              </span>
              <span className="text-lg sm:text-xl font-bold text-rose-400">
                {liveErrors}
              </span>
            </div>
          </div>
        </div>

        {/* Monkeytype Style Typing Viewport: 3 lines visible, seamless flowing words */}
        <div
          onClick={focusInput}
          className="relative h-[144px] overflow-hidden cursor-text outline-none rounded-xl my-2 transition-all"
        >
          {/* Hidden Input capturing real keystrokes */}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 opacity-0 cursor-default pointer-events-none"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {/* Unfocused Click-to-Focus Overlay */}
          {!isFocused && (
            <div 
              className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm bg-black/40 rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-xs font-mono px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 shadow-2xl">
                <AlertCircle className="w-4 h-4 text-sky-400" />
                <span>Click here or press any key to focus typing arena</span>
              </div>
            </div>
          )}

          {/* Words Container with Transform-based line shifting */}
          <div
            ref={wordsContainerRef}
            className="relative w-full transition-transform duration-200 ease-out select-none"
            style={{ 
              transform: `translateY(-${lineScrollY}px)`,
              lineHeight: '48px'
            }}
          >
            {/* Virtual Smooth Caret - placed directly in the words container */}
            {isFocused && (
              <div
                className={`absolute pointer-events-none z-20 ${
                  settings.smoothCaret ? 'smooth-caret' : ''
                } ${!hasStarted ? 'caret-blinking' : ''}`}
                style={{
                  left: `${caretPos.left}px`,
                  top: `${caretPos.top}px`,
                  width: settings.caretStyle === 'block' ? `${caretPos.width || 14}px` : (settings.caretStyle === 'underline' ? '14px' : '2.5px'),
                  height: settings.caretStyle === 'underline' ? '3px' : `${caretPos.height || 30}px`,
                  backgroundColor: 'var(--main-color)',
                  borderRadius: settings.caretStyle === 'underline' ? '2px' : (settings.caretStyle === 'block' ? '3px' : '9999px'),
                  opacity: settings.caretStyle === 'block' ? 0.35 : 1,
                  marginTop: settings.caretStyle === 'underline' ? '24px' : '0px',
                  boxShadow: '0 0 10px var(--main-color)'
                }}
              />
            )}

            {/* Word list: clean flowing text without box pills */}
            {words.map((word, idx) => {
              const isCurrent = idx === currentWordIndex;
              const isCompleted = idx < currentWordIndex;
              const typed = isCurrent ? currentInput : typedHistory[idx] || '';

              return (
                <div
                  key={idx}
                  ref={isCurrent ? activeWordRef : null}
                  className={`word inline-flex items-center mr-3 sm:mr-4 font-mono text-2xl sm:text-3xl tracking-wide select-none ${
                    isCompleted && typed !== word ? 'border-b-2 border-rose-500/80' : ''
                  }`}
                  style={{ height: '48px' }}
                >
                  {word.split('').map((char, charIdx) => {
                    let letterClass = 'text-slate-500 opacity-60'; // Untyped

                    if (charIdx < typed.length) {
                      if (typed[charIdx] === char) {
                        letterClass = 'text-white font-medium opacity-100'; // Correct
                      } else {
                        letterClass = 'text-rose-500 font-semibold opacity-100'; // Incorrect
                      }
                    }

                    return (
                      <span
                        key={charIdx}
                        className={`letter transition-colors duration-75 inline-block ${letterClass}`}
                      >
                        {char}
                      </span>
                    );
                  })}

                  {/* Extra characters typed beyond word length */}
                  {typed.length > word.length && (
                    typed.slice(word.length).split('').map((extraChar, extraIdx) => (
                      <span
                        key={`extra-${extraIdx}`}
                        className="letter-extra text-rose-500 font-semibold underline decoration-rose-500/80 opacity-100 inline-block"
                      >
                        {extraChar}
                      </span>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Arena Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white/10 font-mono text-xs">
          <button
            onClick={() => {
              onRestart();
              initTestWords();
              focusInput();
            }}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/10 text-slate-300 hover:text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)'
            }}
            title="Restart Test (Tab)"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" style={{ color: 'var(--main-color)' }} />
            <span>Restart Test</span>
          </button>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 font-sans">Tab</kbd>
              <span>quick restart</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 font-sans">Esc</kbd>
              <span>reset</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
