'use client';

import React, { useState } from 'react';
import { 
  Keyboard, 
  Volume2, 
  VolumeX, 
  Palette, 
  Sparkles, 
  ChevronDown
} from 'lucide-react';
import { SoundType, ThemeName, CaretStyle } from '../types/typing';

interface HeaderProps {
  sound: SoundType;
  onSoundChange: (sound: SoundType) => void;
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  caretStyle: CaretStyle;
  onCaretStyleChange: (style: CaretStyle) => void;
  smoothCaret: boolean;
  onSmoothCaretChange: (val: boolean) => void;
}

const THEMES: { id: ThemeName; label: string; preview: string; bg: string }[] = [
  { id: 'slate-dark', label: 'Slate Dark', preview: '#38bdf8', bg: '#0b0f19' },
  { id: 'serika-dark', label: 'Serika Dark', preview: '#e2b714', bg: '#1a1b1e' },
  { id: 'cyberpunk', label: 'Cyberpunk', preview: '#00f0ff', bg: '#070712' },
  { id: 'matrix', label: 'Matrix', preview: '#00ff66', bg: '#050d08' },
  { id: 'dracula', label: 'Dracula', preview: '#bd93f9', bg: '#1e1f29' },
];

export const Header: React.FC<HeaderProps> = ({
  sound,
  onSoundChange,
  theme,
  onThemeChange,
  caretStyle,
  onCaretStyleChange,
  smoothCaret,
  onSmoothCaretChange,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const cycleSound = () => {
    const sequence: SoundType[] = ['thock', 'clicky', 'beep', 'off'];
    const nextIdx = (sequence.indexOf(sound) + 1) % sequence.length;
    onSoundChange(sequence[nextIdx]);
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2 select-none z-30">
      <div className="glass-arena rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderColor: 'var(--main-color)',
              borderWidth: '1px'
            }}
          >
            <Keyboard className="w-5 h-5" style={{ color: 'var(--main-color)' }} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Type<span style={{ color: 'var(--main-color)' }}>Rush</span>
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                Studio
              </span>
            </div>
            <p className="text-[11px] font-mono" style={{ color: 'var(--sub-color)' }}>
              next-gen typing arena
            </p>
          </div>
        </div>

        {/* Control Tools */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Sound Selector */}
          <button
            onClick={cycleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--card-border)',
              color: sound !== 'off' ? 'var(--main-color)' : 'var(--sub-color)'
            }}
            title="Cycle keyboard switch sound (Thock / Clicky / Beep / Off)"
          >
            {sound !== 'off' ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="capitalize">{sound}</span>
          </button>

          {/* Theme Selector Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowSettingsMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--card-border)',
                color: 'var(--text-color)'
              }}
            >
              <Palette className="w-3.5 h-3.5" style={{ color: 'var(--main-color)' }} />
              <span className="capitalize">{theme.replace('-', ' ')}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showThemeMenu && (
              <div 
                className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                style={{ 
                  backgroundColor: 'var(--bg-color)', 
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                }}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 mb-1" style={{ color: 'var(--sub-color)' }}>
                  Theme Presets
                </div>
                <div className="flex flex-col gap-1">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onThemeChange(t.id);
                        setShowThemeMenu(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors"
                      style={{
                        backgroundColor: theme === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: theme === t.id ? 'var(--main-color)' : 'var(--text-color)'
                      }}
                    >
                      <span className="font-medium">{t.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-3 h-3 rounded-full border border-white/20" 
                          style={{ backgroundColor: t.preview }} 
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Caret Customization */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--card-border)',
                color: 'var(--text-color)'
              }}
              title="Caret style and smoothness"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--main-color)' }} />
              <span className="hidden sm:inline">Caret</span>
            </button>

            {showSettingsMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                style={{ 
                  backgroundColor: 'var(--bg-color)', 
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                }}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: 'var(--sub-color)' }}>
                  Caret Geometry
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {(['line', 'block', 'underline'] as CaretStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => onCaretStyleChange(style)}
                      className="py-1.5 px-2 rounded-lg capitalize text-center text-xs font-medium transition-all"
                      style={{
                        backgroundColor: caretStyle === style ? 'var(--main-color)' : 'rgba(255,255,255,0.05)',
                        color: caretStyle === style ? '#090d16' : 'var(--sub-color)',
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                  <div>
                    <span className="text-xs block text-white font-medium">Physics Easing</span>
                    <span className="text-[10px] block" style={{ color: 'var(--sub-color)' }}>linear() spring caret</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smoothCaret}
                    onChange={(e) => onSmoothCaretChange(e.target.checked)}
                    className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
