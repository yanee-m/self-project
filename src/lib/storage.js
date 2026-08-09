const NAMESPACE = 'focus-dashboard';

function keyFor(key) {
  return `${NAMESPACE}:${key}`;
}

export function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(keyFor(key));
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(keyFor(key), JSON.stringify(value));
  } catch {
    // storage full or unavailable (e.g. private browsing) — fail silently
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(keyFor(key));
  } catch {
    // ignore
  }
}
