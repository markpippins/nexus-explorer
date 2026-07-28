import React from 'react';
import {
  Trash2,
  Tag,
  FolderInput,
  Download,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FileItem, ThemeMode } from '../types';

interface BatchOperationsBarProps {
  selectedFiles: FileItem[];
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchTag: () => void;
  onBatchMove: () => void;
  onBatchExport: () => void;
  theme: ThemeMode;
}

export const BatchOperationsBar: React.FC<BatchOperationsBarProps> = ({
  selectedFiles,
  onClearSelection,
  onBatchDelete,
  onBatchTag,
  onBatchMove,
  onBatchExport,
  theme,
}) => {
  if (selectedFiles.length === 0) return null;

  const barBg =
    theme === 'steel'
      ? 'bg-[#182436]/95 border-[#2f4260] text-slate-100 shadow-2xl shadow-cyan-950/50'
      : theme === 'dark'
      ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100 shadow-2xl'
      : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%]">
      <div className={`p-3 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200 ${barBg}`}>
        {/* Count badge */}
        <div className="flex items-center gap-2 pl-1 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            {selectedFiles.length}
          </div>
          <span className="text-xs font-semibold">
            Item{selectedFiles.length > 1 ? 's' : ''} Selected
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onBatchTag}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Tags</span>
          </button>

          <button
            onClick={onBatchMove}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
            <span>Move</span>
          </button>

          <button
            onClick={onBatchExport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export</span>
          </button>

          <button
            onClick={onBatchDelete}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-xs opacity-60 hover:opacity-100"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
