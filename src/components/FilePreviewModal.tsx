import React, { useState } from 'react';
import {
  X,
  Edit3,
  Save,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  FileImage,
  Globe,
  Tag,
  Copy,
  Check,
  Calendar,
  HardDrive,
  Info,
} from 'lucide-react';
import { FileItem, ThemeMode } from '../types';
import { formatDate, formatFileSize } from '../utils/fileUtils';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onSaveContent: (fileId: string, newContent: string) => void;
  theme: ThemeMode;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onSaveContent,
  theme,
}) => {
  if (!file) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(file.content || '');
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onSaveContent(file.id, content);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalBg =
    theme === 'steel'
      ? 'bg-[#121a28] border-[#293a54] text-slate-100'
      : theme === 'dark'
      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
      : 'bg-white border-slate-200 text-slate-900';

  const editorBg =
    theme === 'light'
      ? 'bg-slate-50 border-slate-200 text-slate-800 font-mono'
      : theme === 'steel'
      ? 'bg-[#0b1019] border-[#233147] text-cyan-200 font-mono'
      : 'bg-zinc-950 border-zinc-800 text-zinc-200 font-mono';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${modalBg}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">{file.name}</h2>
              <p className="text-xs opacity-60">
                {file.fileType.toUpperCase()} • {formatFileSize(file.size)} • {formatDate(file.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit File</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs"
              title="Copy Content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-current/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body & Sidebar metadata */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {file.fileType === 'bookmark' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Globe className="w-16 h-16 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-lg">{file.name}</h3>
                  <p className="text-xs opacity-60 font-mono mt-1">{file.content}</p>
                </div>
                <a
                  href={file.content}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 flex items-center gap-2 shadow-lg shadow-cyan-950/40"
                >
                  <span>Launch Web Link</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : file.fileType === 'image' ? (
              <div className="h-full flex items-center justify-center p-4">
                <img
                  src={file.content || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26'}
                  alt={file.name}
                  className="max-h-full max-w-full rounded-2xl shadow-xl object-contain"
                />
              </div>
            ) : isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full h-full p-4 rounded-2xl border outline-none text-xs leading-relaxed ${editorBg}`}
              />
            ) : (
              <pre className={`w-full h-full p-4 rounded-2xl border overflow-auto text-xs whitespace-pre-wrap leading-relaxed ${editorBg}`}>
                {content || '// Empty file content'}
              </pre>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="w-64 border-l border-current/10 p-5 space-y-4 text-xs opacity-90 hidden md:block shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-50">
              File Properties
            </div>

            <div className="space-y-3">
              <div>
                <span className="opacity-50 text-[10px] block">File Name</span>
                <span className="font-semibold break-all">{file.name}</span>
              </div>

              <div>
                <span className="opacity-50 text-[10px] block">Type / Extension</span>
                <span className="font-mono capitalize">{file.fileType}</span>
              </div>

              <div>
                <span className="opacity-50 text-[10px] block">File Size</span>
                <span className="font-mono">{formatFileSize(file.size)}</span>
              </div>

              <div>
                <span className="opacity-50 text-[10px] block">Last Modified</span>
                <span>{formatDate(file.updatedAt)}</span>
              </div>

              <div>
                <span className="opacity-50 text-[10px] block">Sync Status</span>
                <span className="text-emerald-400 font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block">
                  {file.cloudSyncStatus}
                </span>
              </div>

              <div>
                <span className="opacity-50 text-[10px] block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {file.tags && file.tags.length > 0 ? (
                    file.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">
                        #{t}
                      </span>
                    ))
                  ) : (
                    <span className="opacity-40 italic">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
