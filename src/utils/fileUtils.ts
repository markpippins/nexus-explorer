import { FileType } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoString;
  }
}

export function detectFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (ext === 'url' || ext === 'webloc') return 'bookmark';
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'json', 'css', 'html', 'sql', 'sh', 'rs', 'go', 'cpp'].includes(ext)) return 'code';
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'avif', 'ico'].includes(ext)) return 'image';
  if (['md', 'txt', 'doc', 'docx', 'rtf'].includes(ext)) return 'document';
  if (ext === 'pdf') return 'pdf';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'audio';
  if (['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(ext)) return 'video';
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return 'archive';
  if (['csv', 'xlsx', 'xls', 'parquet', 'db'].includes(ext)) return 'data';

  return 'document';
}

export function getFileExtensionColor(filename: string, fileType: FileType): string {
  if (fileType === 'folder') return 'text-amber-500';
  if (fileType === 'bookmark') return 'text-cyan-500';
  
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'text-blue-500';
    case 'py':
      return 'text-emerald-500';
    case 'json':
    case 'data':
      return 'text-purple-500';
    case 'md':
      return 'text-slate-400';
    case 'pdf':
      return 'text-rose-500';
    case 'csv':
      return 'text-green-500';
    default:
      return 'text-slate-500';
  }
}
