import { useEffect } from 'react';
import { KeyboardShortcut, ShortcutAction } from '../types';

interface ShortcutHandlers {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  handlers: Partial<Record<ShortcutAction, () => void>>
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger standard shortcuts if target is an input/textarea element
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      for (const sc of shortcuts) {
        const keyMatch = e.key.toLowerCase() === sc.key.toLowerCase();
        const ctrlMatch = sc.ctrlOrCmd ? e.ctrlKey || e.metaKey : !(e.ctrlKey || e.metaKey);
        const shiftMatch = Boolean(sc.shiftKey) === Boolean(e.shiftKey);
        const altMatch = Boolean(sc.altKey) === Boolean(e.altKey);

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // If in input, only allow certain actions like search or escape
          if (isInput && sc.id !== 'search' && sc.id !== 'help') {
            continue;
          }

          const handler = handlers[sc.id];
          if (handler) {
            e.preventDefault();
            e.stopPropagation();
            handler();
            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, handlers]);
}
