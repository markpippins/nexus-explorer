import React, { useState, useEffect } from 'react';
import { X, Folder, File, Edit2, Tag } from 'lucide-react';
import { FileItem, ThemeMode } from '../types';

interface NewItemModalProps {
  isOpen: boolean;
  type: 'file' | 'folder' | null;
  onClose: () => void;
  onCreate: (name: string, type: 'file' | 'folder', content?: string) => void;
  theme: ThemeMode;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  isOpen,
  type,
  onClose,
  onCreate,
  theme,
}) => {
  if (!isOpen || !type) return null;

  const [name, setName] = useState(type === 'file' ? 'untitled.txt' : 'New Folder');
  const [content, setContent] = useState('');

  useEffect(() => {
    setName(type === 'file' ? 'untitled.txt' : 'New Folder');
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), type, content);
    onClose();
  };

  const modalBg =
    theme === 'steel'
      ? 'bg-[#121a28] border-[#293a54] text-slate-100'
      : theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 ${modalBg}`}>
        <div className="flex items-center justify-between pb-2 border-b border-current/10">
          <div className="flex items-center gap-2 font-bold text-base">
            {type === 'folder' ? <Folder className="w-5 h-5 text-amber-400" /> : <File className="w-5 h-5 text-blue-500" />}
            <span>Create New {type === 'folder' ? 'Folder' : 'File'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5 opacity-80">
              {type === 'folder' ? 'Folder Name' : 'File Name (e.g. notes.md, script.py)'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-current/20 bg-black/5 dark:bg-white/5 outline-none font-medium"
            />
          </div>

          {type === 'file' && (
            <div>
              <label className="text-xs font-semibold block mb-1.5 opacity-80">
                Initial Content (Optional)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type initial file body..."
                className="w-full h-24 px-3.5 py-2 text-xs rounded-xl border border-current/20 bg-black/5 dark:bg-white/5 outline-none font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-current/20 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RenameModalProps {
  file: FileItem | null;
  onClose: () => void;
  onRename: (fileId: string, newName: string) => void;
  theme: ThemeMode;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  file,
  onClose,
  onRename,
  theme,
}) => {
  if (!file) return null;

  const [newName, setNewName] = useState(file.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onRename(file.id, newName.trim());
    onClose();
  };

  const modalBg =
    theme === 'steel'
      ? 'bg-[#121a28] border-[#293a54] text-slate-100'
      : theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 ${modalBg}`}>
        <div className="flex items-center justify-between pb-2 border-b border-current/10">
          <div className="flex items-center gap-2 font-bold text-base">
            <Edit2 className="w-4 h-4 text-blue-500" />
            <span>Rename Item</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5 opacity-80">New Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-current/20 bg-black/5 dark:bg-white/5 outline-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-current/20 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TagModalProps {
  files: FileItem[];
  onClose: () => void;
  onSaveTags: (fileIds: string[], tags: string[]) => void;
  theme: ThemeMode;
}

export const TagModal: React.FC<TagModalProps> = ({
  files,
  onClose,
  onSaveTags,
  theme,
}) => {
  if (files.length === 0) return null;

  const [tagInput, setTagInput] = useState(files[0]?.tags ? files[0].tags.join(', ') : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    onSaveTags(files.map((f) => f.id), parsedTags);
    onClose();
  };

  const modalBg =
    theme === 'steel'
      ? 'bg-[#121a28] border-[#293a54] text-slate-100'
      : theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
      : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 ${modalBg}`}>
        <div className="flex items-center justify-between pb-2 border-b border-current/10">
          <div className="flex items-center gap-2 font-bold text-base">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>Edit Tags ({files.length} item{files.length > 1 ? 's' : ''})</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5 opacity-80">
              Tags (Comma separated, e.g. Dev, React, Priority)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-current/20 bg-black/5 dark:bg-white/5 outline-none font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-current/20 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md"
            >
              Save Tags
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
