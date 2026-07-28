export type FileType =
  | 'folder'
  | 'code'
  | 'image'
  | 'document'
  | 'pdf'
  | 'audio'
  | 'video'
  | 'archive'
  | 'data'
  | 'bookmark';

export interface FileItem {
  id: string;
  name: string;
  parentId: string | null; // null or 'root' or parent folder ID
  isFolder: boolean;
  fileType: FileType;
  size: number; // in bytes
  updatedAt: string;
  content?: string;
  tags: string[];
  pinned?: boolean;
  color?: string; // Optional folder color hex/tail
  cloudSyncStatus: 'synced' | 'pending' | 'syncing' | 'error';
  version?: number;
}

export type ThemeMode = 'light' | 'dark' | 'steel';
export type ViewMode = 'grid' | 'list' | 'columns';
export type SortField = 'name' | 'size' | 'updatedAt' | 'fileType';
export type SortDirection = 'asc' | 'desc';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface FolderSearchResponse {
  folderName: string;
  summary: string;
  searchQueries: string[];
  results: SearchResultItem[];
  recommendedBookmarks: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  topicTags: string[];
}

export type ShortcutAction =
  | 'new_file'
  | 'new_folder'
  | 'rename'
  | 'delete'
  | 'select_all'
  | 'copy'
  | 'paste'
  | 'search'
  | 'cloud_sync'
  | 'toggle_search_pane'
  | 'quick_preview'
  | 'help'
  | 'toggle_theme';

export interface KeyboardShortcut {
  id: ShortcutAction;
  label: string;
  category: 'File Operations' | 'Navigation & View' | 'Selection & Edit' | 'System & Sync';
  keyDisplay: string;
  key: string;
  ctrlOrCmd: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface CloudSyncConfig {
  isEnabled: boolean;
  autoSync: boolean;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  deviceName: string;
  pairingCode: string;
  storageUsedBytes: number;
  totalQuotaBytes: number;
  syncHistory: SyncLogEntry[];
}
