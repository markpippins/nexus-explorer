import React, { useState } from 'react';
import {
  Keyboard,
  X,
  Search,
  RotateCcw,
  Edit2,
  Check,
  Command,
} from 'lucide-react';
import { KeyboardShortcut, ThemeMode } from '../types';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  onUpdateShortcut: (id: string, newKeyDisplay: string, newKey: string, ctrl: boolean, shift: boolean) => void;
  onResetShortcuts: () => void;
  theme: ThemeMode;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onUpdateShortcut,
  onResetShortcuts,
  theme,
}) => {
  if (!isOpen) return null;

  const [searchFilter, setSearchFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState<string>('');

  const filteredShortcuts = shortcuts.filter(
    (s) =>
      s.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.keyDisplay.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  const handleRecordKeyDown = (e: React.KeyboardEvent, shortcutId: string) => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    parts.push(e.key.toUpperCase());

    const keyDisplay = parts.join(' + ');
    onUpdateShortcut(
      shortcutId,
      keyDisplay,
      e.key.toLowerCase(),
      e.ctrlKey || e.metaKey,
      e.shiftKey
    );
    setEditingId(null);
  };

  const modalBg =
    theme === 'steel'
      ? 'bg-[#121a28] border-[#293a54] text-slate-100'
      : theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-6 space-y-6 max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${modalBg}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-current/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/10 text-indigo-400">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Customizable Keyboard Shortcuts</h2>
              <p className="text-sm opacity-60">Advanced navigation & hotkey customization</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetShortcuts}
              className="px-3 py-1.5 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold flex items-center gap-1.5"
              title="Reset all shortcuts to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search shortcut command or key..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-current/10 bg-black/5 dark:bg-white/5 outline-none"
          />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {categories.map((cat) => {
            const catShortcuts = filteredShortcuts.filter((s) => s.category === cat);
            if (catShortcuts.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1">
                  {cat}
                </span>

                <div className="border rounded-2xl overflow-hidden divide-y divide-current/10 text-sm">
                  {catShortcuts.map((sc) => {
                    const isEditing = editingId === sc.id;

                    return (
                      <div
                        key={sc.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium">{sc.label}</span>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              readOnly
                              autoFocus
                              placeholder="Press key combination..."
                              onKeyDown={(e) => handleRecordKeyDown(e, sc.id)}
                              onBlur={() => setEditingId(null)}
                              className="px-3 py-1 rounded-lg border border-cyan-400 bg-cyan-950/40 text-cyan-300 text-sm font-mono animate-pulse outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingId(sc.id)}
                              className="px-3 py-1 rounded-lg bg-black/10 dark:bg-white/10 font-mono text-sm font-bold border border-current/10 hover:border-cyan-400 transition-colors flex items-center gap-1.5"
                            >
                              <span>{sc.keyDisplay}</span>
                              <Edit2 className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
