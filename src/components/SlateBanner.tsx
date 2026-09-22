'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Terminal, 
  ExternalLink, 
  CheckCircle, 
  Copy, 
  Check, 
  X, 
  Globe, 
  Cpu, 
  Layers 
} from 'lucide-react';

interface SlateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlateModal: React.FC<SlateModalProps> = ({ isOpen, onClose }) => {
  const [copiedCli, setCopiedCli] = useState(false);

  if (!isOpen) return null;

  const copyCli = () => {
    navigator.clipboard.writeText('catalyst deploy slate');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden font-mono"
        style={{
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--surface-border)',
          color: 'var(--text-color)'
        }}
      >
        {/* Glow */}
        <div 
          className="absolute -top-24 right-0 w-80 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--main-color)' }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Hosted on Catalyst Slate
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Edge
              </span>
            </h2>
            <p className="text-xs" style={{ color: 'var(--sub-color)' }}>
              Zoho Catalyst’s modern serverless frontend hosting platform
            </p>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-700/40">
            <div className="flex items-center gap-2 font-semibold text-white mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Bandwidth Traps</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--sub-color)' }}>
              No surprise bills. Enjoy generous free bandwidth and predictable pricing without per-seat penalties.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-700/40">
            <div className="flex items-center gap-2 font-semibold text-white mb-1">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Global Edge CDN</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--sub-color)' }}>
              Sub-15ms worldwide routing, automatic SSL, preview environments, and instant cache invalidation.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-700/40">
            <div className="flex items-center gap-2 font-semibold text-white mb-1">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Agent-Ready & MCP</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--sub-color)' }}>
              Optimized for vibe-coding and AI coding agents (Claude, Cursor, Copilot) via Zoho MCP tools.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-700/40">
            <div className="flex items-center gap-2 font-semibold text-white mb-1">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Full-Stack Serverless</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--sub-color)' }}>
              Native integration with Catalyst Functions, NoSQL/Data Store, Auth, Stratus storage, and AI Zia.
            </p>
          </div>
        </div>

        {/* Deploy Command */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">$</span>
            <code className="text-emerald-400 font-bold">catalyst deploy slate</code>
          </div>
          <button
            onClick={copyCli}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCli ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <a
            href="https://catalyst.zoho.com/slate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all hover:scale-105"
          >
            <span>Explore Catalyst Slate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
          >
            Back to Typing Test
          </button>
        </div>
      </div>
    </div>
  );
};

export const SlateFooter: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  return (
    <footer className="w-full max-w-4xl mx-auto px-4 py-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono select-none border-t border-slate-800/40">
      <div className="flex items-center gap-2 text-slate-500">
        <span>TypeRush</span>
        <span>•</span>
        <button 
          onClick={onOpenModal}
          className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          Hosted on Catalyst Slate
        </button>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Edge CDN: 12ms
        </span>
        <button
          onClick={onOpenModal}
          className="hover:underline text-slate-400 hover:text-white"
        >
          Why Slate?
        </button>
        <a
          href="https://catalyst.zoho.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-slate-400 hover:text-white flex items-center gap-1"
        >
          Zoho Catalyst <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
};
