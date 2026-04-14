"use client";

import { useRef, useCallback } from "react";

export type ChangeSnippet = {
  /** ISO timestamp when the edit was detected */
  timestamp: string;
  /** 20 words before the edit position */
  before: string;
  /** The changed/inserted text */
  changed: string;
  /** 10 words after the edit stopped */
  after: string;
};

/**
 * Extracts N words before a position from a text string.
 * Position is a character index. Looks backwards from pos.
 */
function wordsBefore(text: string, pos: number, count: number): string {
  const before = text.slice(0, pos);
  const words = before.trim().split(/\s+/).filter(Boolean);
  return words.slice(-count).join(" ");
}

/**
 * Extracts N words after a position from a text string.
 * Position is a character index. Looks forward from pos.
 */
function wordsAfter(text: string, pos: number, count: number): string {
  const after = text.slice(pos);
  const words = after.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, count).join(" ");
}

type ChangeTrackerOptions = {
  /** Milliseconds of inactivity before capturing the "after" context. Default 1000. */
  debounceMs?: number;
};

/**
 * Hook that tracks edit changes with surrounding context.
 *
 * Usage:
 *   const tracker = useChangeTracker();
 *
 *   // In textarea onChange or TipTap onUpdate:
 *   tracker.onEdit(fullText, cursorPosition);
 *
 *   // When the user saves — returns all collected snippets and clears them:
 *   const snippets = tracker.flush();
 */
export function useChangeTracker(options?: ChangeTrackerOptions) {
  const debounceMs = options?.debounceMs ?? 1000;

  // Accumulated snippets for this editing session
  const snippetsRef = useRef<ChangeSnippet[]>([]);

  // Debounce timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks the state when the user started typing
  const editStartRef = useRef<{
    before: string;
    textAtStart: string;
    posAtStart: number;
  } | null>(null);

  // Previous text — used to detect whether text actually changed
  const prevTextRef = useRef<string>("");

  /**
   * Called on every text change (keystroke).
   * @param fullText  The full current text of the document
   * @param cursorPos The current cursor position (character index)
   */
  const onEdit = useCallback(
    (fullText: string, cursorPos: number) => {
      const prevText = prevTextRef.current;
      prevTextRef.current = fullText;

      // If text didn't actually change (e.g. just cursor movement), skip
      if (fullText === prevText) return;

      // If this is the start of a new typing burst, capture the "before" context
      if (!editStartRef.current) {
        editStartRef.current = {
          before: wordsBefore(prevText, cursorPos, 20),
          textAtStart: prevText,
          posAtStart: cursorPos,
        };
      }

      // Clear any previous debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new debounce timer — fires when the user stops typing
      timerRef.current = setTimeout(() => {
        if (!editStartRef.current) return;

        const after = wordsAfter(fullText, cursorPos, 10);

        // Diff: find the changed text between old and new
        // Simple approach: compare from the start position
        const startPos = editStartRef.current.posAtStart;
        const oldText = editStartRef.current.textAtStart;

        // The changed portion is roughly: new text from startPos minus old text from startPos
        // For insertions: the new text is longer, so the delta is the inserted chars
        // For deletions: the new text is shorter
        // For replacements: a mix
        //
        // We use a simple prefix/suffix matching approach:
        let commonPrefix = 0;
        const minLen = Math.min(oldText.length, fullText.length);
        while (commonPrefix < minLen && oldText[commonPrefix] === fullText[commonPrefix]) {
          commonPrefix++;
        }

        let commonSuffix = 0;
        while (
          commonSuffix < minLen - commonPrefix &&
          oldText[oldText.length - 1 - commonSuffix] === fullText[fullText.length - 1 - commonSuffix]
        ) {
          commonSuffix++;
        }

        const changedText = fullText.slice(commonPrefix, fullText.length - commonSuffix);

        const snippet: ChangeSnippet = {
          timestamp: new Date().toISOString(),
          before: editStartRef.current.before,
          changed: changedText,
          after,
        };

        snippetsRef.current.push(snippet);

        // Reset for next typing burst
        editStartRef.current = null;
      }, debounceMs);
    },
    [debounceMs]
  );

  /**
   * Initialize the tracker with the document's current text.
   * Call this once when the editor loads content.
   */
  const init = useCallback((text: string) => {
    prevTextRef.current = text;
    snippetsRef.current = [];
    editStartRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  /**
   * Returns all accumulated snippets and clears the buffer.
   * Call this when the user saves.
   */
  const flush = useCallback((): ChangeSnippet[] => {
    // If there's a pending debounce, fire it immediately? No — we can't
    // because we don't have the latest text/cursor. Instead, if there's
    // an in-progress edit that hasn't been captured yet, capture what we have.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // If there's an edit in progress that wasn't captured, add a partial snippet
    if (editStartRef.current) {
      const partial: ChangeSnippet = {
        timestamp: new Date().toISOString(),
        before: editStartRef.current.before,
        changed: "(unsaved typing burst)",
        after: "",
      };
      snippetsRef.current.push(partial);
      editStartRef.current = null;
    }

    const collected = [...snippetsRef.current];
    snippetsRef.current = [];
    return collected;
  }, []);

  /**
   * Returns the current number of pending snippets (for debug/UI).
   */
  const pendingCount = useCallback(() => snippetsRef.current.length, []);

  return { onEdit, flush, init, pendingCount };
}
