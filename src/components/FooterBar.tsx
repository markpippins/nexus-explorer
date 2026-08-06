import React from 'react';
import { RefreshCw, ShieldCheck, HardDrive, Keyboard } from 'lucide-react';
import { ThemeMode } from '../types';

interface FooterBarProps {
  theme: ThemeMode;
  totalFilesCount: number;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  onOpenCloudModal: () => void;
  onOpenShortcutsModal: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  theme,
  totalFilesCount,
  isSyncing,
  lastSyncedAt,
  onOpenCloudModal,
  onOpenShortcutsModal,
}) => {
  const footerBg =
    theme === 'light'
      ? 'bg-slate-200/90 border-slate-300 text-slate-700'
      : theme === 'steel'
      ? 'bg-[#1e293b] border-[#334155] text-slate-300'
      : 'bg-zinc-900 border-zinc-800 text-zinc-300';

  const keyBadgeBg =
    theme === 'light'
      ? 'bg-slate-300 text-slate-900 border-slate-400/50'
      : 'bg-[#334155] text-[#cbd5e1] border-[#475569]/40';

  return (
    <footer className={`h-10 border-t px-4 flex items-center justify-between text-sm font-medium shrink-0 z-20 ${footerBg}`}>
      {/* Left: Keyboard Shortcuts Bar */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={onOpenShortcutsModal}
          className="flex items-center gap-1.5 hover:text-sky-400 transition-colors shrink-0"
          title="Open Hotkeys Map (?)"
        >
          <Keyboard className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-[11px]">Hotkeys:</span>
        </button>

        <div className="flex items-center gap-2.5 text-[11px] shrink-0">
          <span className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${keyBadgeBg}`}>F2</kbd>
            <span className="opacity-80">Rename</span>
          </span>

          <span className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${keyBadgeBg}`}>Ctrl+F</kbd>
            <span className="opacity-80">Search</span>
          </span>

          <span className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${keyBadgeBg}`}>Ctrl+G</kbd>
            <span className="opacity-80">Google Grounding</span>
          </span>

          <span className="flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${keyBadgeBg}`}>Ctrl+B</kbd>
            <span className="opacity-80">Sync</span>
          </span>
        </div>
      </div>

      {/* Center: Cloud Sync Status */}
      <button
        onClick={onOpenCloudModal}
        className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-black/10 dark:hover:bg-white/5 transition-colors text-[11px] text-[#10b981] font-semibold shrink-0"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSyncing ? 'block' : 'hidden'}`}></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="tracking-wide">
          {isSyncing ? 'Syncing with Cloud...' : 'Cloud Sync Active (v2.4.1)'}
        </span>
      </button>

      {/* Right: Item Count & Available Quota */}
      <div className="flex items-center gap-3 text-[11px] opacity-75 font-mono shrink-0">
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-sky-400" />
          <span>{totalFilesCount} Items</span>
        </span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:inline">10.8 GB / 15 GB Free</span>
      </div>
    </footer>
  );
};
