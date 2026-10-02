import { useEffect, useRef, useState } from 'react';

const PREFIX = 'endrive:v2:';

export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked (private mode) — the game still works, it just won't resume */
  }
}

export function remove(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export function clearAll() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// useState that survives refreshes. `validate` can repair a stale/invalid saved value.
export function usePersistentState(key, initial, validate) {
  const [value, setValue] = useState(() => {
    const init = typeof initial === 'function' ? initial() : initial;
    const stored = load(key, undefined);
    if (stored === undefined) return init;
    if (validate) {
      try {
        return validate(stored, init);
      } catch {
        return init;
      }
    }
    return stored;
  });
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
    }
    save(key, value);
  }, [key, value]);
  return [value, setValue];
}
