'use client';

import React from 'react';
import { Clock, Type, Quote, AtSign, Hash, Check } from 'lucide-react';
import { TestMode, TimeOption, WordCountOption, TestSettings } from '../types/typing';

interface ModeSelectorProps {
  settings: TestSettings;
  onUpdateSettings: (partial: Partial<TestSettings>) => void;
  disabled: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  settings,
  onUpdateSettings,
  disabled
}) => {
  const timeOptions: TimeOption[] = [15, 30, 60];
  const wordOptions: WordCountOption[] = [10, 25, 50, 100];

  return (
    <div 
      className={`w-full max-w-4xl mx-auto my-4 px-2 transition-all ${
        disabled ? 'opacity-30 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div 
        className="glass-arena rounded-2xl p-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
      >
        {/* Modifiers (Punctuation & Numbers) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5">
          <button
            onClick={() => onUpdateSettings({ hasPunctuation: !settings.hasPunctuation })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: settings.hasPunctuation ? 'var(--main-color)' : 'transparent',
              color: settings.hasPunctuation ? '#090d16' : 'var(--sub-color)',
              fontWeight: settings.hasPunctuation ? 700 : 500
            }}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>punctuation</span>
            {settings.hasPunctuation && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            onClick={() => onUpdateSettings({ hasNumbers: !settings.hasNumbers })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: settings.hasNumbers ? 'var(--main-color)' : 'transparent',
              color: settings.hasNumbers ? '#090d16' : 'var(--sub-color)',
              fontWeight: settings.hasNumbers ? 700 : 500
            }}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>numbers</span>
            {settings.hasNumbers && <Check className="w-3 h-3 ml-0.5" />}
          </button>
        </div>

        {/* Primary Modes Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/5">
          <button
            onClick={() => onUpdateSettings({ mode: 'time' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: settings.mode === 'time' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: settings.mode === 'time' ? 'var(--main-color)' : 'var(--sub-color)',
              border: settings.mode === 'time' ? '1px solid var(--card-border)' : '1px solid transparent',
              fontWeight: settings.mode === 'time' ? 700 : 400
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>time</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ mode: 'words' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: settings.mode === 'words' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: settings.mode === 'words' ? 'var(--main-color)' : 'var(--sub-color)',
              border: settings.mode === 'words' ? '1px solid var(--card-border)' : '1px solid transparent',
              fontWeight: settings.mode === 'words' ? 700 : 400
            }}
          >
            <Type className="w-3.5 h-3.5" />
            <span>words</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ mode: 'quote' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: settings.mode === 'quote' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: settings.mode === 'quote' ? 'var(--main-color)' : 'var(--sub-color)',
              border: settings.mode === 'quote' ? '1px solid var(--card-border)' : '1px solid transparent',
              fontWeight: settings.mode === 'quote' ? 700 : 400
            }}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>quote</span>
          </button>
        </div>

        {/* Options (Time / Words durations) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5">
          {settings.mode === 'time' && (
            timeOptions.map((t) => (
              <button
                key={t}
                onClick={() => onUpdateSettings({ timeLimit: t })}
                className="px-2.5 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: settings.timeLimit === t ? 'var(--main-color)' : 'transparent',
                  color: settings.timeLimit === t ? '#090d16' : 'var(--sub-color)',
                  fontWeight: settings.timeLimit === t ? 700 : 500
                }}
              >
                {t}s
              </button>
            ))
          )}

          {settings.mode === 'words' && (
            wordOptions.map((w) => (
              <button
                key={w}
                onClick={() => onUpdateSettings({ wordCount: w })}
                className="px-2.5 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: settings.wordCount === w ? 'var(--main-color)' : 'transparent',
                  color: settings.wordCount === w ? '#090d16' : 'var(--sub-color)',
                  fontWeight: settings.wordCount === w ? 700 : 500
                }}
              >
                {w}
              </button>
            ))
          )}

          {settings.mode === 'quote' && (
            <span className="text-[11px] px-3 py-1 italic font-sans" style={{ color: 'var(--sub-color)' }}>
              Developer Wisdom
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
