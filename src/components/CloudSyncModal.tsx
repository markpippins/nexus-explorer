import React, { useState } from 'react';
import {
  Cloud,
  X,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Globe,
  Database,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { CloudSyncConfig, ThemeMode } from '../types';
import { formatFileSize } from '../utils/fileUtils';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CloudSyncConfig;
  onTriggerSync: () => void;
  onToggleAutoSync: () => void;
  theme: ThemeMode;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onTriggerSync,
  onToggleAutoSync,
  theme,
}) => {
  if (!isOpen) return null;

  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(config.pairingCode);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const modalBg =
    theme === 'steel'
      ? 'bg-[#121a28] border-[#2a3c57] text-slate-100'
      : theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
      : 'bg-white border-slate-200 text-slate-900';

  const cardBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200'
      : theme === 'steel'
      ? 'bg-[#1b2638] border-[#2d405e]'
      : 'bg-zinc-950 border-zinc-800';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 ${modalBg}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600/10 text-cyan-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Cloud Storage Synchronization</h2>
              <p className="text-sm opacity-60">Cross-platform device pairing & live sync status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pairing Code for Cross-Platform Access */}
        <div className={`p-4 rounded-2xl border space-y-3 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Device Sync Pairing Code
            </span>
            <span className="text-[10px] opacity-60">Valid across iOS, Android & Desktop</span>
          </div>

          <p className="text-sm opacity-80 leading-relaxed">
            Use this secure pairing token on your mobile or second laptop to access your synchronized ExplorerNova files anywhere.
          </p>

          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/10 dark:bg-white/10 font-mono text-sm font-bold tracking-widest text-cyan-300">
            <span>{config.pairingCode}</span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 flex items-center gap-1"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Sync Controls & Storage Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border space-y-3 ${cardBg}`}>
            <span className="text-sm font-bold uppercase tracking-wider opacity-60 block">
              Auto Sync Status
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Real-time Background Sync</p>
                <p className="text-[10px] opacity-60">Syncs file edits automatically</p>
              </div>
              <button
                onClick={onToggleAutoSync}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                  config.autoSync ? 'bg-cyan-600' : 'bg-black/20 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.autoSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-3 ${cardBg}`}>
            <span className="text-sm font-bold uppercase tracking-wider opacity-60 block">
              Manual Sync Action
            </span>
            <button
              onClick={onTriggerSync}
              disabled={config.isSyncing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/30"
            >
              <RefreshCw className={`w-4 h-4 ${config.isSyncing ? 'animate-spin' : ''}`} />
              <span>{config.isSyncing ? 'Syncing Files...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Sync History Table */}
        <div className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-wider opacity-60 px-1">
            Recent Synchronization Activity
          </span>
          <div className="border rounded-2xl overflow-hidden divide-y divide-current/10 text-sm">
            {config.syncHistory.map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold">{log.action}</p>
                    <p className="text-[10px] opacity-60">{log.details}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono opacity-50 shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
