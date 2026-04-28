// Polyfill for the window.storage API used inside Claude artifacts.
// In a regular browser (Vite dev server, production build) we back it with localStorage.
// Same async signatures so CrettoHub.jsx can be used unchanged.

const PREFIX = "crettohub::";

function makeShim() {
  return {
    async get(key) {
      try {
        const value = localStorage.getItem(PREFIX + key);
        if (value === null) return null;
        return { key, value, shared: false };
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, String(value));
        return { key, value, shared: false };
      } catch {
        return null;
      }
    },
    async delete(key) {
      try {
        localStorage.removeItem(PREFIX + key);
        return { key, deleted: true, shared: false };
      } catch {
        return null;
      }
    },
    async list(prefix = "") {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const fullKey = localStorage.key(i);
          if (fullKey && fullKey.startsWith(PREFIX)) {
            const key = fullKey.slice(PREFIX.length);
            if (!prefix || key.startsWith(prefix)) keys.push(key);
          }
        }
        return { keys, prefix, shared: false };
      } catch {
        return null;
      }
    }
  };
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = makeShim();
}
