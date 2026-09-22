'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ModeSelector } from '../components/ModeSelector';
import { TypingArea } from '../components/TypingArea';
import { ResultModal } from '../components/ResultModal';
import { TestSettings, TestResult } from '../types/typing';

export default function Home() {
  const [settings, setSettings] = useState<TestSettings>({
    mode: 'time',
    timeLimit: 30,
    wordCount: 25,
    hasPunctuation: false,
    hasNumbers: false,
    sound: 'thock',
    caretStyle: 'line',
    theme: 'slate-dark',
    smoothCaret: true,
  });

  const [isTestActive, setIsTestActive] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleUpdateSettings = (partial: Partial<TestSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    setResult(null);
    setIsTestActive(false);
  };

  const handleRestart = () => {
    setResult(null);
    setIsTestActive(false);
  };

  const handleTestStart = () => {
    setIsTestActive(true);
    setResult(null);
  };

  const handleTestComplete = (res: TestResult) => {
    setIsTestActive(false);
    setResult(res);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-sky-400 selection:text-black relative bg-grid-pattern">
      {/* Dynamic Ambient Background Glow */}
      <div 
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-25 -z-10 transition-all duration-700"
        style={{ backgroundColor: 'var(--main-color)' }}
      />

      {/* Header */}
      <Header
        sound={settings.sound}
        onSoundChange={(sound) => handleUpdateSettings({ sound })}
        theme={settings.theme}
        onThemeChange={(theme) => handleUpdateSettings({ theme })}
        caretStyle={settings.caretStyle}
        onCaretStyleChange={(caretStyle) => handleUpdateSettings({ caretStyle })}
        smoothCaret={settings.smoothCaret}
        onSmoothCaretChange={(smoothCaret) => handleUpdateSettings({ smoothCaret })}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-4 py-6 z-10">
        {/* Mode Selector */}
        {!result && (
          <ModeSelector
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            disabled={isTestActive}
          />
        )}

        {/* Typing Arena or Result Screen */}
        {result ? (
          <ResultModal
            result={result}
            onRestart={handleRestart}
          />
        ) : (
          <TypingArea
            key={`${settings.mode}-${settings.timeLimit}-${settings.wordCount}-${settings.hasPunctuation}-${settings.hasNumbers}`}
            settings={settings}
            onComplete={handleTestComplete}
            onTestStart={handleTestStart}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Minimal Clean Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs font-mono select-none text-slate-500 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">TypeRush</span>
          <span>•</span>
          <span>Studio Edition</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-sans">Tab</kbd> restart</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-sans">Esc</kbd> reset</span>
        </div>
      </footer>
    </div>
  );
}
