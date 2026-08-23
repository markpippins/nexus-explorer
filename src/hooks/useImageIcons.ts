import { useEffect, useState } from 'react';
import {
  isLiveMode,
  isImageServiceAvailable,
} from '../services/imageIconService';

export interface ImageIconsState {
  /** Whether live mode is active (false => mock mode, local icons only). */
  live: boolean;
  /**
   * null = still probing, true = image service UP, false = unreachable.
   * When false or null the UI renders the lucide fallback icons.
   */
  available: boolean | null;
}

/**
 * Resolves whether image-server icon substitution should be used.
 * In live mode this probes the image service once on mount; the result is
 * surfaced so the UI can fall back to local lucide icons when the service is
 * unavailable (documented fallback — no fabricated live data).
 */
export function useImageIcons(): ImageIconsState {
  const live = isLiveMode();
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!live) {
      setAvailable(false);
      return;
    }
    let cancelled = false;
    isImageServiceAvailable().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [live]);

  return { live, available };
}
