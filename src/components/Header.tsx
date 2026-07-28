import React from 'react';
import {
  Folder,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Columns,
  Sun,
  Moon,
  Shield,
  Cloud,
  CloudLightning,
  Sparkles,
  Keyboard,
  Settings,
  Plus,
  RotateCw,
} from 'lucide-react';
import { FileItem, ThemeMode, ViewMode } from '../types';

interface HeaderProps {
  currentFolder: FileItem | null;
  folderPathItems: FileItem[];
  onNavigateToFolder: (folderId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isSearchPaneOpen: boolean;
  onToggleSearchPane: () => void;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  onOpenCloudModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenNewItemModal: (type: 'file' | 'folder') => void;
  totalFilesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentFolder,
  folderPathItems,
  onNavigateToFolder,
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  viewMode,
  onViewModeChange,
  isSearchPaneOpen,
  onToggleSearchPane,
  isSyncing,
  lastSyncedAt,
  onOpenCloudModal,
  onOpenShortcutsModal,
  onOpenNewItemModal,
  totalFilesCount,
}) => {
  // Theme specific classes
  const headerBg =
    theme === 'light'
      ? 'bg-white/95 border-slate-200 text-slate-800'
      : theme === 'steel'
      ? 'bg-[#1e293b]/95 border-[#334155] text-slate-100'
      : 'bg-zinc-900/95 border-zinc-800 text-zinc-100';

  const inputBg =
    theme === 'light'
      ? 'bg-slate-100 border-slate-200 text-slate-800 focus:bg-white'
      : theme === 'steel'
      ? 'bg-[#0f172a] border-[#334155] text-slate-100 focus:border-[#38bdf8]'
      : 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:bg-zinc-900';

  const buttonActive =
    theme === 'steel'
      ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-sm'
      : theme === 'dark'
      ? 'bg-blue-600 text-white shadow-sm'
      : 'bg-slate-900 text-white shadow-sm';

  const buttonInactive =
    theme === 'light'
      ? 'text-slate-600 hover:bg-slate-100'
      : theme === 'steel'
      ? 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f8fafc]'
      : 'text-zinc-400 hover:bg-zinc-800';

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 py-3 ${headerBg}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Top / Left: Brand & Breadcrumbs Navigation */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          {/* Logo */}
          <div
            onClick={() => onNavigateToFolder(null)}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              theme === 'steel'
                ? 'bg-[#38bdf8] text-slate-950 font-black shadow-lg shadow-sky-950/40 group-hover:scale-105'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md group-hover:scale-105'
            }`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-[#38bdf8]">
                STEEL.IO
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest ml-1.5 opacity-60 px-1.5 py-0.5 rounded border border-[#334155] text-[#94a3b8]">
                Bento Drive
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-current opacity-20 shrink-0" />

          {/* Breadcrumb path */}
          <nav className="flex items-center gap-1.5 text-sm font-medium shrink-0">
            <button
              onClick={() => onNavigateToFolder(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                folderPathItems.length === 0 ? buttonActive : buttonInactive
              }`}
            >
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Root Drive</span>
            </button>

            {folderPathItems.map((folder, index) => {
              const isLast = index === folderPathItems.length - 1;
              return (
                <React.Fragment key={folder.id}>
                  <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  <button
                    onClick={() => onNavigateToFolder(folder.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors max-w-[160px] truncate ${
                      isLast ? buttonActive : buttonInactive
                    }`}
                    title={folder.name}
                  >
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Search Bar, Action Buttons, Themes, Search Pane Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files or Ctrl+F..."
              className={`w-full pl-9 pr-8 py-1.5 text-sm rounded-xl border outline-none transition-all ${inputBg}`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Create New Item Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onOpenNewItemModal('file')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                theme === 'steel'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title="New File (Ctrl+N)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New File</span>
            </button>
            <button
              onClick={() => onOpenNewItemModal('folder')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${buttonInactive}`}
              title="New Folder (Ctrl+Shift+N)"
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">New Folder</span>
            </button>
          </div>

          {/* View Modes */}
          <div className={`flex items-center p-0.5 rounded-xl border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? buttonActive : buttonInactive}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? buttonActive : buttonInactive}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('columns')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'columns' ? buttonActive : buttonInactive}`}
              title="Columns View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Selector (Light, Dark, Steel) */}
          <div className={`flex items-center p-0.5 rounded-xl border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'}`}>
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : buttonInactive}`}
              title="Light Theme"
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : buttonInactive}`}
              title="Dark Theme"
            >
              <Moon className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={() => onThemeChange('steel')}
              className={`p-1.5 rounded-lg transition-all ${theme === 'steel' ? 'bg-[#253347] text-cyan-300 shadow-sm' : buttonInactive}`}
              title="Steel Metallic Theme"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          {/* Cloud Sync Quick Indicator */}
          <button
            onClick={onOpenCloudModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all ${buttonInactive}`}
            title="Cloud Storage Synchronization"
          >
            {isSyncing ? (
              <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
          </button>

          {/* Dual-Pane Search Grounding Toggle */}
          <button
            onClick={onToggleSearchPane}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isSearchPaneOpen
                ? theme === 'steel'
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-900/40'
                  : 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : buttonInactive
            }`}
            title="Toggle Google Search Results Pane (Ctrl+G)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-bold">Folder Google Search</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              On
            </span>
          </button>

          {/* Keyboard Shortcuts Dialog Trigger */}
          <button
            onClick={onOpenShortcutsModal}
            className={`p-2 rounded-xl border transition-colors ${buttonInactive}`}
            title="Custom Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
