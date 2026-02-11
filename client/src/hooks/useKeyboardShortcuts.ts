import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl === undefined || e.ctrlKey === shortcut.ctrl;
        const metaMatches = shortcut.meta === undefined || e.metaKey === shortcut.meta;
        const shiftMatches = shortcut.shift === undefined || e.shiftKey === shortcut.shift;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches) {
          // Check if we're in an input, textarea, or contenteditable
          const target = e.target as HTMLElement;
          const isInput = 
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

          // For Enter shortcuts, allow triggering even when in input
          // For other shortcuts, prevent if in input (unless explicitly allowed)
          if (!isInput || shortcut.key.toLowerCase() === 'enter') {
            e.preventDefault();
            shortcut.handler();
            break;
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Utility to detect Mac vs Windows/Linux
export const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Format shortcut for display
export function formatShortcut(shortcut: Pick<ShortcutHandler, 'key' | 'ctrl' | 'meta' | 'shift'>): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl && !isMac) parts.push('Ctrl');
  if (shortcut.meta || (shortcut.ctrl && isMac)) parts.push('⌘');
  if (shortcut.shift) parts.push('⇧');
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}
