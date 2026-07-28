import React, { useState, useRef } from 'react';
import {
  Folder,
  FileCode,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Globe,
  File as FileIcon,
  Star,
  Trash2,
  Edit2,
  Copy,
  FolderInput,
  Eye,
  Tag,
  ArrowUpDown,
  MoreVertical,
  UploadCloud,
  Check,
  Search,
} from 'lucide-react';
import { FileItem, FileType, SortDirection, SortField, ThemeMode, ViewMode } from '../types';
import { formatDate, formatFileSize, getFileExtensionColor } from '../utils/fileUtils';

interface FileExplorerViewProps {
  files: FileItem[];
  currentFolderId: string | null;
  selectedFileIds: Set<string>;
  onToggleSelectFile: (id: string, isMulti: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onNavigateToFolder: (folderId: string) => void;
  onOpenFilePreview: (file: FileItem) => void;
  onRenameFile: (file: FileItem) => void;
  onDeleteFiles: (ids: string[]) => void;
  onTogglePinFile: (file: FileItem) => void;
  onMoveFiles: (fileIds: string[], targetFolderId: string | null) => void;
  onUploadExternalFiles: (filesList: FileList) => void;
  viewMode: ViewMode;
  theme: ThemeMode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onOpenNewItemModal: (type: 'file' | 'folder') => void;
  onOpenTagModal: (files: FileItem[]) => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  files,
  currentFolderId,
  selectedFileIds,
  onToggleSelectFile,
  onSelectAll,
  onClearSelection,
  onNavigateToFolder,
  onOpenFilePreview,
  onRenameFile,
  onDeleteFiles,
  onTogglePinFile,
  onMoveFiles,
  onUploadExternalFiles,
  viewMode,
  theme,
  sortField,
  sortDirection,
  onSortChange,
  onOpenNewItemModal,
  onOpenTagModal,
}) => {
  const [draggedFileIds, setDraggedFileIds] = useState<string[]>([]);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isWindowDragging, setIsWindowDragging] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetFile: FileItem | null;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Render appropriate file icon
  const getIconForFile = (file: FileItem) => {
    if (file.isFolder) {
      return (
        <div className="w-12 h-12 rounded-xl bg-[#334155] text-[#38bdf8] flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-105">
          <Folder className="w-6 h-6 fill-[#38bdf8]/20" />
        </div>
      );
    }
    switch (file.fileType) {
      case 'code':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#ef4444] text-white flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <FileCode className="w-6 h-6" />
          </div>
        );
      case 'image':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <FileImage className="w-6 h-6" />
          </div>
        );
      case 'document':
      case 'pdf':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <FileText className="w-6 h-6" />
          </div>
        );
      case 'data':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        );
      case 'archive':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <FileArchive className="w-6 h-6" />
          </div>
        );
      case 'bookmark':
        return (
          <div className="w-12 h-12 rounded-xl bg-[#38bdf8] text-slate-950 flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <Globe className="w-6 h-6" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-[#334155] text-slate-200 flex items-center justify-center font-bold text-base shadow-md transition-transform group-hover:scale-105">
            <FileIcon className="w-6 h-6" />
          </div>
        );
    }
  };

  // Drag & Drop handlers for file reordering/moving
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    const ids = selectedFileIds.has(file.id)
      ? Array.from(selectedFileIds)
      : [file.id];
    setDraggedFileIds(ids);
    e.dataTransfer.setData('text/plain', JSON.stringify(ids));
  };

  const handleDragOverFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedFileIds.includes(folderId)) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeaveFolder = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    if (draggedFileIds.length > 0) {
      // Don't drop folder into itself
      const validIds = draggedFileIds.filter((id) => id !== targetFolderId);
      if (validIds.length > 0) {
        onMoveFiles(validIds, targetFolderId);
      }
      setDraggedFileIds([]);
    }
  };

  // External desktop file drag & drop handlers
  const handleWindowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWindowDragging(true);
  };

  const handleWindowDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.clientX <= 0 || e.clientY <= 0) {
      setIsWindowDragging(false);
    }
  };

  const handleWindowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsWindowDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadExternalFiles(e.dataTransfer.files);
    }
  };

  // Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent, file: FileItem | null) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 200),
      y: Math.min(e.clientY, window.innerHeight - 250),
      targetFile: file,
    });
    if (file && !selectedFileIds.has(file.id)) {
      onToggleSelectFile(file.id, false);
    }
  };

  // Theme styling
  const cardBg =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-800 hover:border-blue-400'
      : theme === 'steel'
      ? 'bg-[#1e293b] border-[#334155] text-slate-100 hover:border-[#38bdf8] hover:bg-[#1e293b]/90'
      : 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:border-blue-500';

  const cardSelected =
    theme === 'steel'
      ? 'bg-[#334155] border-[#38bdf8] text-slate-50 ring-2 ring-[#38bdf8]/50'
      : theme === 'dark'
      ? 'bg-zinc-800 border-blue-500 ring-2 ring-blue-500/50'
      : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/40';

  return (
    <div
      ref={containerRef}
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
      onContextMenu={(e) => handleContextMenu(e, null)}
      onClick={() => setContextMenu(null)}
      className="flex-1 overflow-y-auto p-4 md:p-6 relative select-none h-full"
    >
      {/* External Drag Overlay */}
      {isWindowDragging && (
        <div className="absolute inset-0 z-40 bg-blue-600/20 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-pulse">
          <UploadCloud className="w-16 h-16 text-blue-500 mb-3" />
          <h3 className="text-xl font-bold">Drop Files Here to Upload</h3>
          <p className="text-xs opacity-80 mt-1">
            Files will be imported directly into the current directory.
          </p>
        </div>
      )}

      {/* Sorting Controls Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-current opacity-80 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="opacity-60">Sort by:</span>
          <button
            onClick={() => onSortChange('name')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortField === 'name' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => onSortChange('size')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortField === 'size' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Size {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => onSortChange('updatedAt')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortField === 'updatedAt' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            Date {sortField === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="opacity-60">{files.length} items</span>
          {selectedFileIds.size > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-blue-500 hover:underline"
            >
              Clear selection ({selectedFileIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {files.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center opacity-60">
            <Folder className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-base">This folder is empty</h3>
            <p className="text-xs opacity-60 mt-1">
              Create a new file, folder, or drag files from your computer to get started.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onOpenNewItemModal('file')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
            >
              Create File
            </button>
            <button
              onClick={() => onOpenNewItemModal('folder')}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-current/20 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Create Folder
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {files.map((file) => {
            const isSelected = selectedFileIds.has(file.id);
            const isDragTarget = dragOverFolderId === file.id;

            return (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleDragStart(e, file)}
                onDragOver={(e) => file.isFolder && handleDragOverFolder(e, file.id)}
                onDragLeave={handleDragLeaveFolder}
                onDrop={(e) => file.isFolder && handleDropOnFolder(e, file.id)}
                onClick={(e) => onToggleSelectFile(file.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                onDoubleClick={() => {
                  if (file.isFolder) {
                    onNavigateToFolder(file.id);
                  } else {
                    onOpenFilePreview(file);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, file)}
                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                  isSelected ? cardSelected : cardBg
                } ${isDragTarget ? 'ring-4 ring-cyan-400 scale-105' : ''}`}
              >
                {/* Checkbox & Pin Action */}
                <div className="flex items-center justify-between gap-1 z-10">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectFile(file.id, true);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-current/30 opacity-0 group-hover:opacity-100 hover:border-current'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinFile(file);
                    }}
                    className={`p-1 rounded-lg transition-opacity ${
                      file.pinned
                        ? 'text-amber-400 opacity-100'
                        : 'opacity-0 group-hover:opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${file.pinned ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Icon & File Name */}
                <div className="flex flex-col items-center text-center my-auto space-y-1.5">
                  <div className="transition-transform group-hover:scale-110">
                    {getIconForFile(file)}
                  </div>
                  <span className="font-semibold text-xs truncate max-w-full leading-tight">
                    {file.name}
                  </span>
                </div>

                {/* File Details Footer */}
                <div className="flex items-center justify-between text-[10px] opacity-60 pt-1 border-t border-current/10">
                  <span>{file.isFolder ? 'Folder' : formatFileSize(file.size)}</span>
                  {file.tags && file.tags.length > 0 && (
                    <span className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 truncate max-w-[60px]">
                      #{file.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <div className="border rounded-2xl overflow-hidden divide-y divide-current/10">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider opacity-60 bg-black/5 dark:bg-white/5">
            <span className="col-span-6">Name</span>
            <span className="col-span-2">Date Modified</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-2 text-right">Size</span>
          </div>

          {files.map((file) => {
            const isSelected = selectedFileIds.has(file.id);

            return (
              <div
                key={file.id}
                draggable
                onDragStart={(e) => handleDragStart(e, file)}
                onClick={(e) => onToggleSelectFile(file.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                onDoubleClick={() => {
                  if (file.isFolder) {
                    onNavigateToFolder(file.id);
                  } else {
                    onOpenFilePreview(file);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, file)}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs transition-colors cursor-pointer ${
                  isSelected ? cardSelected : cardBg
                }`}
              >
                <div className="col-span-6 flex items-center gap-3 truncate">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectFile(file.id, true);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-current/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>

                  <div className="shrink-0">{getIconForFile(file)}</div>

                  <span className="font-semibold truncate">{file.name}</span>

                  {file.pinned && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>

                <span className="col-span-2 opacity-60 text-[11px]">
                  {formatDate(file.updatedAt)}
                </span>

                <span className="col-span-2 opacity-60 capitalize text-[11px]">
                  {file.fileType}
                </span>

                <span className="col-span-2 text-right font-mono opacity-60 text-[11px]">
                  {file.isFolder ? '--' : formatFileSize(file.size)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-52 py-1.5 rounded-2xl shadow-2xl border backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-100"
        >
          {contextMenu.targetFile ? (
            <>
              <button
                onClick={() => {
                  if (contextMenu.targetFile?.isFolder) {
                    onNavigateToFolder(contextMenu.targetFile.id);
                  } else if (contextMenu.targetFile) {
                    onOpenFilePreview(contextMenu.targetFile);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>{contextMenu.targetFile.isFolder ? 'Open Folder' : 'Quick Preview (Space)'}</span>
              </button>

              <button
                onClick={() => {
                  onRenameFile(contextMenu.targetFile!);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Rename (F2)</span>
              </button>

              <button
                onClick={() => {
                  onTogglePinFile(contextMenu.targetFile!);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>{contextMenu.targetFile.pinned ? 'Unpin' : 'Pin to Top'}</span>
              </button>

              <button
                onClick={() => {
                  onOpenTagModal([contextMenu.targetFile!]);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                <span>Edit Tags</span>
              </button>

              <div className="h-px bg-current/10 my-1" />

              <button
                onClick={() => {
                  onDeleteFiles([contextMenu.targetFile!.id]);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-rose-600 hover:text-white text-rose-500 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete (Del)</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onOpenNewItemModal('file');
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <FileIcon className="w-4 h-4" />
                <span>New File (Ctrl+N)</span>
              </button>

              <button
                onClick={() => {
                  onOpenNewItemModal('folder');
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Folder className="w-4 h-4 text-amber-400" />
                <span>New Folder (Ctrl+Shift+N)</span>
              </button>

              <div className="h-px bg-current/10 my-1" />

              <button
                onClick={() => {
                  onSelectAll();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Select All (Ctrl+A)</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
