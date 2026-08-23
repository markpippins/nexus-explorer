import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Star,
  Trash2,
  HardDrive,
  Tag,
  Cloud,
  Globe,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FileItem, ThemeMode } from '../types';
import { formatFileSize } from '../utils/fileUtils';
import { useImageIcons } from '../hooks/useImageIcons';
import { getFolderImageUrl } from '../services/imageIconService';

/** Folder icon using the nexus-console image-substitution technique: when
 *  live and the image service is UP, render the folder's image from the image
 *  server (fade-in once loaded); on load failure or unavailability, fall back
 *  to the lucide folder icon. */
function FolderIcon({
  name,
  isExpanded,
  live,
  available,
}: {
  name: string;
  isExpanded: boolean;
  live: boolean;
  available: boolean | null;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (live && available === true && !failed) {
    return (
      <div className="relative w-4 h-4 shrink-0">
        <img
          src={getFolderImageUrl(name)}
          alt={name}
          className={`w-4 h-4 object-cover rounded-sm transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  return isExpanded ? (
    <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
  ) : (
    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
  );
}

interface SidebarProps {
  files: FileItem[];
  /** Lazy-loaded child folders per folder id ('' = root) — provided in live
   *  mode so the sidebar fetches each folder's children on demand instead of
   *  receiving a full tree. When undefined, the tree is derived from `files`. */
  folderChildren?: Record<string, FileItem[]>;
  /** Fetch + cache a folder's children (live mode). Called on expand and to
   *  reveal the active folder's path. */
  onLoadFolderChildren?: (folderId: string) => void;
  currentFolderId: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  showTrashOnly: boolean;
  onToggleTrashOnly: () => void;
  theme: ThemeMode;
  onOpenNewItemModal: (type: 'file' | 'folder') => void;
  onOpenCloudModal: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  folderChildren,
  onLoadFolderChildren,
  currentFolderId,
  onNavigateToFolder,
  selectedTag,
  onSelectTag,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  showTrashOnly,
  onToggleTrashOnly,
  theme,
  onOpenNewItemModal,
  onOpenCloudModal,
  isSyncing,
  onTriggerSync,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true,
    'folder-react19': true,
    'folder-ai-ml': true,
  });

  // Image-service state for folder icon substitution (nexus-console technique).
  const { live, available } = useImageIcons();

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => {
      const next = { ...prev, [folderId]: !prev[folderId] };
      // Lazy-load this folder's children the first time it's expanded.
      if (next[folderId] && folderChildren && folderChildren[folderId] === undefined) {
        onLoadFolderChildren?.(folderId);
      }
      return next;
    });
  };

  // Auto-expand the ancestors of the currently open folder so the tree always
  // reveals the active location. In live mode folder ids are fs paths, so
  // ancestors come from the path and are lazy-loaded on demand; in mock mode
  // the parentId chain is walked. Only ever adds expansions.
  useEffect(() => {
    if (!currentFolderId) return;
    const toExpand = new Set<string>();
    if (folderChildren) {
      const parts = currentFolderId.split('/');
      for (let i = 1; i < parts.length; i++) {
        const anc = parts.slice(0, i).join('/');
        toExpand.add(anc);
        onLoadFolderChildren?.(anc);
      }
    } else {
      let id: string | null = currentFolderId;
      let guard = 0;
      while (id && guard++ < 100) {
        const folder = files.find((f) => f.id === id && f.isFolder);
        if (!folder) break;
        const parent =
          folder.parentId === 'root' || folder.parentId === null ? null : folder.parentId;
        if (!parent) break;
        toExpand.add(parent);
        id = parent;
      }
    }
    if (toExpand.size === 0) return;
    setExpandedFolders((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const fid of toExpand) {
        if (!next[fid]) {
          next[fid] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [currentFolderId, folderChildren, files, onLoadFolderChildren]);

  // Children of a folder. Live mode: from the lazy-loaded map ('' = root);
  // mock mode: derived from the current `files` list.
  const getChildren = (parentId: string | null): FileItem[] => {
    if (folderChildren) {
      const key = parentId === null || parentId === 'root' ? '' : parentId;
      return folderChildren[key] ?? [];
    }
    return files.filter(
      (f) => f.isFolder && (f.parentId === parentId || (parentId === 'root' && f.parentId === null))
    );
  };

  // Collect all unique tags
  const allTags = Array.from(
    new Set(files.flatMap((f) => f.tags || []))
  ).sort();

  // Root folder items
  const rootFolders = files.filter(
    (f) => f.isFolder && (f.parentId === 'root' || f.parentId === null)
  );

  // Total storage calculation
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalQuota = 15 * 1024 * 1024 * 1024; // 15 GB
  const storagePercent = Math.min(100, Math.max(1, (totalSizeBytes / totalQuota) * 100));

  // Theme styling
  const sidebarBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200 text-slate-800'
      : theme === 'steel'
      ? 'bg-[#1e293b] border-[#334155] text-[#94a3b8]'
      : 'bg-zinc-950 border-zinc-800/80 text-zinc-200';

  const itemHover =
    theme === 'light'
      ? 'hover:bg-slate-200/70 text-slate-700'
      : theme === 'steel'
      ? 'hover:bg-[#334155]/60 hover:text-[#f8fafc]'
      : 'hover:bg-zinc-800/80 text-zinc-300';

  const itemActive =
    theme === 'steel'
      ? 'bg-[#334155] text-[#f8fafc] border-l-4 border-[#38bdf8] font-bold shadow-sm'
      : theme === 'dark'
      ? 'bg-blue-900/40 text-blue-300 border-r-2 border-blue-500 font-medium'
      : 'bg-slate-200 text-slate-900 border-r-2 border-slate-900 font-medium';

  const renderFolderTree = (parentId: string | null, depth = 0) => {
    const childFolders = getChildren(parentId);

    if (childFolders.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {childFolders.map((folder) => {
          const isExpanded = expandedFolders[folder.id];
          const isSelected = currentFolderId === folder.id;
          // In live (lazy) mode a folder may have unloaded children, so the
          // expand affordance is always shown; mock mode only shows it when
          // children are known to exist.
          const subChildren = getChildren(folder.id);
          const hasChildrenHint = folderChildren ? true : subChildren.length > 0;

          return (
            <div key={folder.id} style={{ paddingLeft: `${depth * 12}px` }}>
              <div
                onClick={() => {
                  onNavigateToFolder(folder.id);
                  onSelectTag(null);
                }}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  isSelected ? itemActive : itemHover
                }`}
              >
                {hasChildrenHint ? (
                  <button
                    onClick={(e) => toggleFolderExpand(folder.id, e)}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </button>
                ) : (
                  <span className="w-4" />
                )}

                <FolderIcon
                  name={folder.name}
                  isExpanded={isExpanded}
                  live={live}
                  available={available}
                />

                <span className="truncate flex-1">{folder.name}</span>

                {folder.pinned && (
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>

              {isExpanded &&
                (folderChildren && folderChildren[folder.id] === undefined ? (
                  // Children not fetched yet — brief loading placeholder until
                  // the lazy load resolves (then it renders the real tree).
                  <div
                    style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
                    className="py-0.5 text-[10px] font-mono text-gray-500"
                  >
                    loading…
                  </div>
                ) : (
                  renderFolderTree(folder.id, depth + 1)
                ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside className={`w-64 shrink-0 border-r flex flex-col h-[calc(100vh-61px)] overflow-y-auto select-none ${sidebarBg}`}>
      {/* Quick Navigation Section */}
      <div className="p-3 border-b border-current opacity-90 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2 py-1">
          Navigation
        </div>

        <button
          onClick={() => {
            onNavigateToFolder(null);
            onSelectTag(null);
          }}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${
            currentFolderId === null && !showFavoritesOnly && !showTrashOnly && !selectedTag
              ? itemActive
              : itemHover
          }`}
        >
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span>Root Workspace</span>
          </div>
          <span className="text-[10px] opacity-60 bg-current/10 px-1.5 py-0.5 rounded-full">
            {files.filter((f) => f.parentId === 'root' || f.parentId === null).length}
          </span>
        </button>

        <button
          onClick={onToggleFavoritesOnly}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${
            showFavoritesOnly ? itemActive : itemHover
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <span>Pinned & Favorites</span>
          </div>
          <span className="text-[10px] opacity-60 bg-current/10 px-1.5 py-0.5 rounded-full">
            {files.filter((f) => f.pinned).length}
          </span>
        </button>

        <button
          onClick={onToggleTrashOnly}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${
            showTrashOnly ? itemActive : itemHover
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Trash Bin</span>
          </div>
        </button>
      </div>

      {/* Folders Tree Explorer */}
      <div className="p-3 border-b border-current opacity-90 flex-1 overflow-y-auto space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">
            Folder Directory
          </span>
          <button
            onClick={() => onOpenNewItemModal('folder')}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-sm opacity-70 hover:opacity-100"
            title="Create Folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {renderFolderTree('root')}
      </div>

      {/* Filter by Tags */}
      {allTags.length > 0 && (
        <div className="p-3 border-b border-current opacity-90 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2">
            Filter by Tag
          </div>
          <div className="flex flex-wrap gap-1 px-1">
            {allTags.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isActive ? null : tag)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 opacity-80'
                  }`}
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  <span>#{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Storage Meter & Cloud Sync Card */}
      <div className="p-3 mt-auto space-y-3">
        {/* Storage Bar */}
        <div className="p-3 rounded-2xl border border-current opacity-90 bg-black/5 dark:bg-white/5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold opacity-80">Cloud Storage</span>
            <span className="text-[10px] opacity-60">{formatFileSize(totalSizeBytes)} / 15 GB</span>
          </div>
          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, storagePercent)}%` }}
            />
          </div>
        </div>

        {/* Sync Status Action */}
        <div
          onClick={onOpenCloudModal}
          className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
            theme === 'steel'
              ? 'bg-[#182333] border-[#2c3d59]'
              : 'bg-black/5 dark:bg-white/5 border-current'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-sm font-bold">Cloud Sync Status</p>
                <p className="text-[10px] opacity-60">Auto Sync Active</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTriggerSync();
              }}
              className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-cyan-600 hover:text-white transition-colors"
              title="Sync Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
