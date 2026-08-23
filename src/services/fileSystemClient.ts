/**
 * file-system-server (:4042) REST client for throttler-ui.
 *
 * Mirrors the contract monaco-judge (`fileSystem.ts`) and nexus-console
 * (`direct-file-system.service.ts`) use, so the live file browser talks to
 * the same sandbox root (FS_ROOT_DIR) over `/api/fs`, `/api/fs/content`,
 * and `/fs`.
 *
 * Modes:
 *  - live (default): all listing/read/create/update/delete/rename/move/copy
 *    operations hit the real file service.
 *  - mock (explicit VITE_THROTTLER_FILE_MODE=mock): the app keeps using
 *    INITIAL_FILES + localStorage; this client is never called.
 */

export const FILE_MODE: 'live' | 'mock' =
  (import.meta.env.VITE_THROTTLER_FILE_MODE || 'live') === 'mock' ? 'mock' : 'live';

export const FILE_SRV_URL: string = (
  import.meta.env.VITE_FILE_SRV_URL || 'http://localhost:4042'
).replace(/\/+$/, '');

export const isLiveFileMode = (): boolean => FILE_MODE === 'live';

export type FsEntryType = 'directory' | 'file' | 'symlink';

export interface FsEntry {
  name: string;
  path: string;
  type: FsEntryType;
  size?: number;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body && typeof body.detail === 'string') detail = body.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`file-system-server ${detail}`);
  }
  return (await res.json()) as T;
}

function encodePath(path: string): string {
  return encodeURIComponent(path);
}

function toParts(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export const fileSystem = {
  /** List a directory (flat, non-recursive). Empty string = sandbox root. */
  async list(path = ''): Promise<FsEntry[]> {
    const q = path ? `?path=${encodePath(path)}` : '';
    const data = await request<{ entries: FsEntry[] }>(`${FILE_SRV_URL}/api/fs${q}`);
    return data.entries || [];
  },

  /** Read file content as UTF-8. */
  async read(path: string): Promise<string> {
    const data = await request<{ content: string }>(
      `${FILE_SRV_URL}/api/fs/content?path=${encodePath(path)}`
    );
    return data.content ?? '';
  },

  /** Write file content (creates parent directories). */
  async write(path: string, content: string): Promise<void> {
    await request<{ saved: string }>(
      `${FILE_SRV_URL}/api/fs/content?path=${encodePath(path)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }
    );
  },

  /** Create a directory (recursive). */
  async mkdir(path: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'mkdir', path: toParts(path) }),
    });
  },

  /** Remove a directory (recursive). */
  async rmdir(path: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'rmdir', path: toParts(path) }),
    });
  },

  /** Create a file in the given directory path. */
  async newFile(dirPath: string, filename: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'newfile', path: toParts(dirPath), filename }),
    });
  },

  /** Delete a file. */
  async deleteFile(parentPath: string, filename: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'deletefile', path: toParts(parentPath), filename }),
    });
  },

  /** Rename a file or directory (path = full path incl. current name). */
  async rename(path: string, newName: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'rename', path: toParts(path), newName }),
    });
  },

  /** Move a file/directory to a destination path. */
  async move(sourcePath: string, destPath: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'move', path: toParts(sourcePath), toPath: toParts(destPath) }),
    });
  },

  /** Copy a file/directory to a destination path. */
  async copy(sourcePath: string, destPath: string): Promise<void> {
    await request(`${FILE_SRV_URL}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'copy', path: toParts(sourcePath), toPath: toParts(destPath) }),
    });
  },

  /**
   * Recursively collect every directory under a path (the full folder tree).
   * The `/api/fs` endpoint only lists one directory at a time, so this walks
   * the tree breadth-first. Returns folder entries with their fs-relative
   * paths (id = path, parentId = parent path), ready to map to FileItems.
   */
  async listAllFolders(path = ''): Promise<FsEntry[]> {
    const folders: FsEntry[] = [];
    const queue = [path];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const entries = await this.list(current);
      for (const e of entries) {
        if (e.type === 'directory') {
          folders.push(e);
          queue.push(e.path);
        }
      }
    }
    return folders;
  },
};
