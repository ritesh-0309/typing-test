'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Share2, 
  Check,
  TrendingUp,
  Award
} from 'lucide-react';
import { TestResult } from '../types/typing';

interface ResultModalProps {
  result: TestResult;
  onRestart: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    if (result.wpm > 30 || result.accuracy >= 90) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#e2b714', '#10b981', '#f43f5e']
      });
    }
  }, [result.wpm, result.accuracy]);

  const copyShareText = () => {
    const text = `⌨️ TypeRush Result
WPM: ${result.wpm} | Accuracy: ${result.accuracy}% | Raw: ${result.rawWpm}
Mode: ${result.mode} (${result.modeDetail}) | Time: ${result.testTime}s`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate SVG path for WPM performance graph
  const renderGraph = () => {
    const samples = result.samples;
    if (samples.length < 2) {
      return (
        <div className="h-28 flex items-center justify-center text-xs font-mono rounded-xl bg-black/20 border border-white/5 my-4" style={{ color: 'var(--sub-color)' }}>
          Detailed speed curve generated for runs longer than 3 seconds
        </div>
      );
    }

    const width = 600;
    const height = 130;
    const padding = 24;

    const maxWpm = Math.max(...samples.map((s) => Math.max(s.wpm, s.rawWpm)), 30);
    const minWpm = 0;

    const getX = (index: number) => padding + (index / (samples.length - 1)) * (width - padding * 2);
    const getY = (val: number) => height - padding - ((val - minWpm) / (maxWpm - minWpm || 1)) * (height - padding * 2);

    const wpmPoints = samples.map((s, idx) => `${getX(idx)},${getY(s.wpm)}`).join(' ');
    const rawPoints = samples.map((s, idx) => `${getX(idx)},${getY(s.rawWpm)}`).join(' ');

    const areaPath = `M ${getX(0)},${getY(samples[0].wpm)} ` +
      samples.map((s, idx) => `L ${getX(idx)},${getY(s.wpm)}`).join(' ') +
      ` L ${getX(samples.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;

    return (
      <div className="w-full relative mt-4">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2" style={{ color: 'var(--sub-color)' }}>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--main-color)' }} />
            Speed Curve
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--main-color)' }}></span>
              wpm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 opacity-60"></span>
              raw
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              errors
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          {/* Subtle grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--card-border)" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--card-border)" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--card-border)" strokeDasharray="3 3" />

          {/* Area fill under curve */}
          <path d={areaPath} fill="var(--main-color)" fillOpacity="0.08" />

          {/* Raw WPM line */}
          <polyline
            fill="none"
            stroke="var(--sub-color)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.5"
            points={rawPoints}
          />

          {/* Net WPM line */}
          <polyline
            fill="none"
            stroke="var(--main-color)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={wpmPoints}
          />

          {/* Error marks */}
          {samples.map((s, idx) => {
            if (s.errors > 0) {
              return (
                <circle
                  key={idx}
                  cx={getX(idx)}
                  cy={getY(s.wpm)}
                  r="3.5"
                  fill="#ef4444"
                  stroke="var(--bg-color)"
                  strokeWidth="1.5"
                />
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-6 animate-in fade-in duration-300 select-none">
      {/* Main Scorecard Card */}
      <div 
        className="glass-arena rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* Ambient Top Glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--main-color)' }}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Hero WPM */}
          <div className="md:col-span-1 flex flex-col justify-center">
            <span className="text-xs uppercase font-mono tracking-widest font-semibold" style={{ color: 'var(--sub-color)' }}>
              wpm
            </span>
            <div 
              className="text-6xl sm:text-7xl font-extrabold tracking-tight my-1"
              style={{ color: 'var(--main-color)' }}
            >
              {result.wpm}
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--sub-color)' }}>
              raw: <span className="text-white font-bold">{result.rawWpm}</span>
            </div>
          </div>

          {/* Hero Accuracy */}
          <div className="md:col-span-1 flex flex-col justify-center">
            <span className="text-xs uppercase font-mono tracking-widest font-semibold" style={{ color: 'var(--sub-color)' }}>
              acc
            </span>
            <div 
              className="text-6xl sm:text-7xl font-extrabold tracking-tight my-1 text-white"
            >
              {result.accuracy}<span className="text-3xl text-slate-400">%</span>
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--sub-color)' }}>
              consistency: <span className="text-white font-bold">{result.consistency}%</span>
            </div>
          </div>

          {/* Detailed Metric Badges */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/25 border border-white/5">
              <span className="text-[11px] block" style={{ color: 'var(--sub-color)' }}>test type</span>
              <span className="font-semibold text-white capitalize">{result.mode} {result.modeDetail}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/25 border border-white/5">
              <span className="text-[11px] block" style={{ color: 'var(--sub-color)' }}>time spent</span>
              <span className="font-semibold text-white">{result.testTime}s</span>
            </div>

            <div className="p-3 rounded-xl bg-black/25 border border-white/5 col-span-2">
              <span className="text-[11px] block mb-1" style={{ color: 'var(--sub-color)' }}>characters</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-400 font-bold">{result.charStats.correct} <span className="text-[10px] font-normal text-slate-400">correct</span></span>
                <span className="text-rose-400 font-bold">{result.charStats.incorrect} <span className="text-[10px] font-normal text-slate-400">incorrect</span></span>
                <span className="text-amber-400 font-bold">{result.charStats.extra} <span className="text-[10px] font-normal text-slate-400">extra</span></span>
                <span className="text-slate-500 font-bold">{result.charStats.missed} <span className="text-[10px] font-normal text-slate-400">missed</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        {renderGraph()}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{
                backgroundColor: 'var(--main-color)',
                color: '#090d16'
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Test</span>
            </button>

            <button
              onClick={copyShareText}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-medium transition-all hover:bg-white/10"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-color)'
              }}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Share Score'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Award className="w-4 h-4 text-sky-400" />
            <span>TypeRush Certified Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
