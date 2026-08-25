import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFormDraftOptions {
  key: string;
  ttlMs?: number;
}

interface DraftMeta {
  data: Record<string, unknown>;
  savedAt: number;
}

export function useFormDraft<T extends Record<string, unknown>>(
  defaults: T,
  { key, ttlMs = 24 * 60 * 60 * 1000 }: UseFormDraftOptions
) {
  const [values, setValues] = useState<T>(defaults);
  const isRestored = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isRestored.current) return;
    isRestored.current = true;
    try {
      const raw = localStorage.getItem(`sipnam-draft-${key}`);
      if (!raw) return;
      const parsed: DraftMeta = JSON.parse(raw);
      if (Date.now() - parsed.savedAt > ttlMs) {
        localStorage.removeItem(`sipnam-draft-${key}`);
        return;
      }
      setValues((prev) => ({ ...prev, ...parsed.data }));
    } catch {
      // noop
    }
  }, [key, ttlMs]);

  const persist = useCallback(
    (data: T) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try {
          const meta: DraftMeta = { data, savedAt: Date.now() };
          localStorage.setItem(`sipnam-draft-${key}`, JSON.stringify(meta));
        } catch {
          // noop
        }
      }, 500);
    },
    [key]
  );

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValues((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clear = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      localStorage.removeItem(`sipnam-draft-${key}`);
    } catch {
      // noop
    }
    setValues(defaults);
  }, [key, defaults]);

  const hasDraft = (() => {
    try {
      const raw = localStorage.getItem(`sipnam-draft-${key}`);
      if (!raw) return false;
      const parsed: DraftMeta = JSON.parse(raw);
      return Date.now() - parsed.savedAt <= ttlMs;
    } catch {
      return false;
    }
  })();

  return { values, update, clear, hasDraft };
}
