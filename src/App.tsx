import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileItem,
  ThemeMode,
  ViewMode,
  SortField,
  SortDirection,
  CloudSyncConfig,
  KeyboardShortcut,
} from './types';
import { INITIAL_FILES, DEFAULT_KEYBOARD_SHORTCUTS } from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchPane } from './components/SearchPane';
import { FileExplorerView } from './components/FileExplorerView';
import { BatchOperationsBar } from './components/BatchOperationsBar';
import { FooterBar } from './components/FooterBar';
import { FilePreviewModal } from './components/FilePreviewModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { NewItemModal, RenameModal, TagModal } from './components/ActionModals';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { detectFileType } from './utils/fileUtils';

const STORAGE_KEY_FILES = 'explorernova_files_v1';
const STORAGE_KEY_THEME = 'explorernova_theme_v1';
const STORAGE_KEY_SHORTCUTS = 'explorernova_shortcuts_v1';

export default function App() {
  // 1. Storage & Files State
  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved files:', e);
    }
    return INITIAL_FILES;
  });

  // Save files state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save files:', e);
    }
  }, [files]);

  // 2. Navigation & Selection State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('folder-react19');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [clipboardFileIds, setClipboardFileIds] = useState<string[]>([]);

  // 3. View & Filter State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return (saved as ThemeMode) || 'steel';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showTrashOnly, setShowTrashOnly] = useState(false);

  // 4. Dual Pane Active Folder Search State
  const [isSearchPaneOpen, setIsSearchPaneOpen] = useState<boolean>(true);

  // 5. Cloud Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>({
    isEnabled: true,
    autoSync: true,
    lastSyncedAt: new Date().toLocaleTimeString(),
    isSyncing: false,
    deviceName: 'ExplorerNova Desktop Agent',
    pairingCode: 'EX-9921-CROSS-SYNC',
    storageUsedBytes: 4200000,
    totalQuotaBytes: 15 * 1024 * 1024 * 1024,
    syncHistory: [
      {
        id: 'sync-1',
        timestamp: new Date().toLocaleTimeString(),
        action: 'Initial Cloud Backup',
        details: 'Synchronized 12 files across cloud storage cluster',
        status: 'success',
      },
    ],
  });

  // 6. Shortcuts State
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHORTCUTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_KEYBOARD_SHORTCUTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(shortcuts));
  }, [shortcuts]);

  // 7. Modals State
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [tagModalFiles, setTagModalFiles] = useState<FileItem[]>([]);
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Active folder object calculation
  const activeFolder = useMemo(() => {
    return files.find((f) => f.id === currentFolderId && f.isFolder) || null;
  }, [files, currentFolderId]);

  // Path Breadcrumbs Array
  const folderPathItems = useMemo(() => {
    const path: FileItem[] = [];
    let currId = currentFolderId;

    while (currId) {
      const folder = files.find((f) => f.id === currId && f.isFolder);
      if (folder) {
        path.unshift(folder);
        currId = folder.parentId === 'root' ? null : folder.parentId;
      } else {
        break;
      }
    }
    return path;
  }, [files, currentFolderId]);

  // Calculated folder path string
  const folderPathString = useMemo(() => {
    if (folderPathItems.length === 0) return '/Root';
    return '/' + folderPathItems.map((f) => f.name).join('/');
  }, [folderPathItems]);

  // Filtered & Sorted files for the current view
  const visibleFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Trash view
        if (showTrashOnly) {
          return file.tags?.includes('trash');
        }
        if (file.tags?.includes('trash')) {
          return false;
        }

        // Favorites view
        if (showFavoritesOnly && !file.pinned) {
          return false;
        }

        // Filter by Tag
        if (selectedTag && !file.tags?.includes(selectedTag)) {
          return false;
        }

        // Folder structure scoping (unless performing global search)
        if (!searchQuery && !showFavoritesOnly && !selectedTag) {
          const matchParent =
            currentFolderId === null
              ? file.parentId === 'root' || file.parentId === null
              : file.parentId === currentFolderId;
          if (!matchParent) return false;
        }

        // Quick text search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchName = file.name.toLowerCase().includes(query);
          const matchTags = file.tags?.some((t) => t.toLowerCase().includes(query));
          const matchContent = file.content?.toLowerCase().includes(query);
          return matchName || matchTags || matchContent;
        }

        return true;
      })
      .sort((a, b) => {
        // Folders always pinned to top first
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;

        let res = 0;
        if (sortField === 'name') {
          res = a.name.localeCompare(b.name);
        } else if (sortField === 'size') {
          res = a.size - b.size;
        } else if (sortField === 'updatedAt') {
          res = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        } else if (sortField === 'fileType') {
          res = a.fileType.localeCompare(b.fileType);
        }

        return sortDirection === 'asc' ? res : -res;
      });
  }, [
    files,
    currentFolderId,
    searchQuery,
    selectedTag,
    showFavoritesOnly,
    showTrashOnly,
    sortField,
    sortDirection,
  ]);

  // Selection handlers
  const handleToggleSelectFile = useCallback((id: string, isMulti: boolean) => {
    setSelectedFileIds((prev) => {
      const next = new Set(isMulti ? prev : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allVisibleIds = visibleFiles.map((f) => f.id);
    setSelectedFileIds(new Set(allVisibleIds));
  }, [visibleFiles]);

  const handleClearSelection = useCallback(() => {
    setSelectedFileIds(new Set());
  }, []);

  // File CRUD Operations
  const handleCreateItem = (name: string, type: 'file' | 'folder', content = '') => {
    const isFolder = type === 'folder';
    const fileType = isFolder ? 'folder' : detectFileType(name);

    const newItem: FileItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      parentId: currentFolderId || 'root',
      isFolder,
      fileType,
      size: isFolder ? 4096 : Math.max(128, new Blob([content]).size),
      updatedAt: new Date().toISOString(),
      content,
      tags: isFolder ? ['Folder'] : ['Custom'],
      cloudSyncStatus: 'synced',
    };

    setFiles((prev) => [newItem, ...prev]);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              name: newName,
              fileType: f.isFolder ? 'folder' : detectFileType(newName),
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    );
  };

  const handleDeleteFiles = (idsToDelete: string[]) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (idsToDelete.includes(f.id)) {
          const newTags = Array.from(new Set([...(f.tags || []), 'trash']));
          return { ...f, tags: newTags };
        }
        return f;
      })
    );
    setSelectedFileIds(new Set());
  };

  const handleTogglePinFile = (file: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, pinned: !f.pinned } : f))
    );
  };

  const handleMoveFiles = (fileIds: string[], targetFolderId: string | null) => {
    setFiles((prev) =>
      prev.map((f) =>
        fileIds.includes(f.id)
          ? {
              ...f,
              parentId: targetFolderId || 'root',
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    );
    setSelectedFileIds(new Set());
  };

  const handleSaveFileContent = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              content: newContent,
              size: new Blob([newContent]).size,
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    );
  };

  const handleSaveTags = (fileIds: string[], tags: string[]) => {
    setFiles((prev) =>
      prev.map((f) => (fileIds.includes(f.id) ? { ...f, tags } : f))
    );
  };

  // Import Bookmark directly into active folder from Google Search Grounding pane!
  const handleAddBookmarkToFileExplorer = (title: string, url: string, description?: string) => {
    const filename = `${title.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 30)}.url`;
    const bookmarkItem: FileItem = {
      id: `bm-${Date.now()}`,
      name: filename,
      parentId: currentFolderId || 'root',
      isFolder: false,
      fileType: 'bookmark',
      size: url.length,
      updatedAt: new Date().toISOString(),
      content: url,
      tags: ['Bookmark', 'WebResult'],
      cloudSyncStatus: 'synced',
    };

    setFiles((prev) => [bookmarkItem, ...prev]);
  };

  // Upload external desktop files drag-dropped into app
  const handleUploadExternalFiles = (filesList: FileList) => {
    Array.from(filesList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const newItem: FileItem = {
          id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          parentId: currentFolderId || 'root',
          isFolder: false,
          fileType: detectFileType(file.name),
          size: file.size,
          updatedAt: new Date().toISOString(),
          content: text || `[Binary or uploaded file content: ${file.name}]`,
          tags: ['Imported', 'Upload'],
          cloudSyncStatus: 'synced',
        };
        setFiles((prev) => [newItem, ...prev]);
      };
      reader.readAsText(file);
    });
  };

  // Trigger Cloud Sync
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setCloudConfig((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toLocaleTimeString(),
        syncHistory: [
          {
            id: `sync-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: 'Manual Cloud Sync',
            details: `Successfully backed up ${files.length} items to cloud storage`,
            status: 'success',
          },
          ...prev.syncHistory,
        ],
      }));
    }, 1500);
  };

  // Batch Export (JSON Backup)
  const handleBatchExport = () => {
    const selectedItems = files.filter((f) => selectedFileIds.has(f.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `explorernova_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Shortcuts Handlers Configuration
  const keyboardHandlers = useMemo(
    () => ({
      new_file: () => setNewItemType('file'),
      new_folder: () => setNewItemType('folder'),
      rename: () => {
        const selected = files.find((f) => selectedFileIds.has(f.id));
        if (selected) setRenameTarget(selected);
      },
      delete: () => {
        if (selectedFileIds.size > 0) {
          handleDeleteFiles(Array.from(selectedFileIds));
        }
      },
      select_all: handleSelectAll,
      copy: () => setClipboardFileIds(Array.from(selectedFileIds)),
      paste: () => {
        if (clipboardFileIds.length > 0) {
          const copies = files
            .filter((f) => clipboardFileIds.includes(f.id))
            .map((f) => ({
              ...f,
              id: `copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: `Copy of ${f.name}`,
              parentId: currentFolderId || 'root',
              updatedAt: new Date().toISOString(),
            }));
          setFiles((prev) => [...copies, ...prev]);
        }
      },
      search: () => {
        const input = document.querySelector('input[placeholder*="Search files"]') as HTMLInputElement;
        if (input) input.focus();
      },
      toggle_search_pane: () => setIsSearchPaneOpen((prev) => !prev),
      toggle_theme: () =>
        setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'steel' : 'light')),
      cloud_sync: handleTriggerSync,
      quick_preview: () => {
        const selected = files.find((f) => selectedFileIds.has(f.id));
        if (selected) setPreviewFile(selected);
      },
      help: () => setIsShortcutsModalOpen(true),
    }),
    [files, selectedFileIds, clipboardFileIds, currentFolderId, handleSelectAll]
  );

  useKeyboardShortcuts(shortcuts, keyboardHandlers);

  // App container theme background
  const appBg =
    theme === 'light'
      ? 'bg-slate-100 text-slate-900'
      : theme === 'steel'
      ? 'bg-[#0f172a] text-[#cbd5e1]'
      : 'bg-zinc-950 text-zinc-100';

  return (
    <div className={`h-screen flex flex-col font-sans transition-colors duration-200 overflow-hidden ${appBg}`}>
      {/* Top Header */}
      <Header
        currentFolder={activeFolder}
        folderPathItems={folderPathItems}
        onNavigateToFolder={(folderId) => {
          setCurrentFolderId(folderId);
          setSelectedFileIds(new Set());
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onThemeChange={setTheme}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isSearchPaneOpen={isSearchPaneOpen}
        onToggleSearchPane={() => setIsSearchPaneOpen(!isSearchPaneOpen)}
        isSyncing={isSyncing}
        lastSyncedAt={cloudConfig.lastSyncedAt}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onOpenNewItemModal={setNewItemType}
        totalFilesCount={files.length}
      />

      {/* Main Content Workspace: Sidebar + File Explorer View + Active Folder Search Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          files={files}
          currentFolderId={currentFolderId}
          onNavigateToFolder={(folderId) => {
            setCurrentFolderId(folderId);
            setSelectedFileIds(new Set());
            setShowFavoritesOnly(false);
            setShowTrashOnly(false);
          }}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => {
            setShowFavoritesOnly(!showFavoritesOnly);
            setShowTrashOnly(false);
          }}
          showTrashOnly={showTrashOnly}
          onToggleTrashOnly={() => {
            setShowTrashOnly(!showTrashOnly);
            setShowFavoritesOnly(false);
          }}
          theme={theme}
          onOpenNewItemModal={setNewItemType}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          isSyncing={isSyncing}
          onTriggerSync={handleTriggerSync}
        />

        {/* Center File Explorer View */}
        <FileExplorerView
          files={visibleFiles}
          currentFolderId={currentFolderId}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={handleToggleSelectFile}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onNavigateToFolder={(folderId) => {
            setCurrentFolderId(folderId);
            setSelectedFileIds(new Set());
          }}
          onOpenFilePreview={setPreviewFile}
          onRenameFile={setRenameTarget}
          onDeleteFiles={handleDeleteFiles}
          onTogglePinFile={handleTogglePinFile}
          onMoveFiles={handleMoveFiles}
          onUploadExternalFiles={handleUploadExternalFiles}
          viewMode={viewMode}
          theme={theme}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field) => {
            if (sortField === field) {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
              setSortField(field);
              setSortDirection('asc');
            }
          }}
          onOpenNewItemModal={setNewItemType}
          onOpenTagModal={setTagModalFiles}
        />

        {/* Right Pane: Dual Pane Google Search Grounding for Active Folder */}
        {isSearchPaneOpen && (
          <SearchPane
            activeFolder={activeFolder}
            folderPath={folderPathString}
            filesInFolder={files.filter((f) => f.parentId === currentFolderId)}
            theme={theme}
            onAddBookmarkToFileExplorer={handleAddBookmarkToFileExplorer}
            onClosePane={() => setIsSearchPaneOpen(false)}
          />
        )}
      </div>

      {/* Footer Status Bar */}
      <FooterBar
        theme={theme}
        totalFilesCount={files.length}
        isSyncing={isSyncing}
        lastSyncedAt={cloudConfig.lastSyncedAt}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* Floating Batch Operations Bar */}
      <BatchOperationsBar
        selectedFiles={files.filter((f) => selectedFileIds.has(f.id))}
        onClearSelection={handleClearSelection}
        onBatchDelete={() => handleDeleteFiles(Array.from(selectedFileIds))}
        onBatchTag={() => setTagModalFiles(files.filter((f) => selectedFileIds.has(f.id)))}
        onBatchMove={() => {
          const target = prompt('Enter target folder name (or leave empty for Root):');
          if (target !== null) {
            const targetFolder = files.find(
              (f) => f.isFolder && f.name.toLowerCase() === target.trim().toLowerCase()
            );
            handleMoveFiles(Array.from(selectedFileIds), targetFolder ? targetFolder.id : 'root');
          }
        }}
        onBatchExport={handleBatchExport}
        theme={theme}
      />

      {/* Action Dialog Modals */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onSaveContent={handleSaveFileContent}
        theme={theme}
      />

      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        config={cloudConfig}
        onTriggerSync={handleTriggerSync}
        onToggleAutoSync={() =>
          setCloudConfig((prev) => ({ ...prev, autoSync: !prev.autoSync }))
        }
        theme={theme}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={shortcuts}
        onUpdateShortcut={(id, keyDisplay, key, ctrl, shift) => {
          setShortcuts((prev) =>
            prev.map((s) =>
              s.id === id
                ? { ...s, keyDisplay, key, ctrlOrCmd: ctrl, shiftKey: shift }
                : s
            )
          );
        }}
        onResetShortcuts={() => setShortcuts(DEFAULT_KEYBOARD_SHORTCUTS)}
        theme={theme}
      />

      <NewItemModal
        isOpen={newItemType !== null}
        type={newItemType}
        onClose={() => setNewItemType(null)}
        onCreate={handleCreateItem}
        theme={theme}
      />

      <RenameModal
        file={renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={handleRenameFile}
        theme={theme}
      />

      <TagModal
        files={tagModalFiles}
        onClose={() => setTagModalFiles([])}
        onSaveTags={handleSaveTags}
        theme={theme}
      />
    </div>
  );
}
