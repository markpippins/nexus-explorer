/**
 * Image-server icon substitution for throttler-ui.
 *
 * Mirrors the nexus-console contract (ImageService.getIconUrl normalization +
 * ImageClientService URL shapes) so folder and file-type icons come from the
 * real image service (typescript/image-server, default :9081) when live.
 *
 * Modes:
 *  - live (default): icon URLs are built against VITE_IMAGE_SERVER_URL; the
 *    lucide icon set is used only as a documented fallback when the image
 *    service is unreachable or a specific image fails to load.
 *  - mock (explicit VITE_THROTTLER_MODE=mock): local lucide icons only; no
 *    image-service requests are made.
 */

export const THROTTLER_MODE: 'live' | 'mock' =
  (import.meta.env.VITE_THROTTLER_MODE || 'live') === 'mock' ? 'mock' : 'live';

export const IMAGE_SERVER_URL: string = (
  import.meta.env.VITE_IMAGE_SERVER_URL || 'http://localhost:9081'
).replace(/\/+$/, '');

export const isLiveMode = (): boolean => THROTTLER_MODE === 'live';

/**
 * Same normalization as nexus-console ImageService.getIconUrl:
 *  - names ending in `.js` lose all dots (interchangeable with the dotless form)
 *  - ` & ` collapses to `-`, remaining spaces to `-`, then lowercased
 */
export function normalizeImageName(name: string): string {
  let folderName = name;
  if (folderName.toLowerCase().endsWith('.js')) {
    folderName = folderName.replace(/\./g, '');
  }
  const normalized = folderName.replace(/ & /g, '-');
  const folderNameWithDashes = normalized.replace(/ /g, '-');
  return folderNameWithDashes.toLowerCase();
}

/** Folder icon URL — same shape as nexus-console ImageService.getIconUrl:
 *  the default route `/{normalizedName}` (searches all image-server folder
 *  locations), NOT the `/name/` endpoint. */
export function getFolderImageUrl(name: string): string {
  return `${IMAGE_SERVER_URL}/${encodeURIComponent(normalizeImageName(name))}`;
}

/** File-type icon URL by extension — same shape as ImageClientService.getImageUrlByExtension. */
export function getFileImageUrl(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return `${IMAGE_SERVER_URL}/ext/${encodeURIComponent(ext)}`;
}

/**
 * Health probe for the image service. Returns true only when the service
 * answers `/health` with status UP. Never throws — a reachability failure
 * simply reports the service as unavailable so callers fall back.
 */
export async function isImageServiceAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${IMAGE_SERVER_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data?.status === 'UP';
  } catch {
    return false;
  }
}
