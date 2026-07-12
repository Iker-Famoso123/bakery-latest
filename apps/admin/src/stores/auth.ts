import type { UserDto } from '@rf/types';
import { create } from 'zustand';

const REFRESH_KEY = 'rf_refresh';

interface Session {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

interface AuthState {
  /** Access token: solo en memoria (se pierde al recargar → más seguro ante XSS). */
  accessToken: string | null;
  user: UserDto | null;
  /** true cuando terminó el intento de refresco silencioso inicial. */
  ready: boolean;
  setSession: (s: Session) => void;
  clear: () => void;
  bootstrap: () => Promise<void>;
}

// Un solo bootstrap en vuelo: evita que dos llamadas concurrentes (p. ej.
// el doble montaje de StrictMode, o varias pestañas) disparen refrescos
// paralelos con el mismo token y activen la detección de reuso.
let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  ready: false,

  setSession: ({ accessToken, refreshToken, user }) => {
    // El refresh sí persiste, para reanudar la sesión al recargar.
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ accessToken, user });
  },

  clear: () => {
    localStorage.removeItem(REFRESH_KEY);
    set({ accessToken: null, user: null });
  },

  bootstrap: () => {
    bootstrapPromise ??= (async () => {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        set({ ready: true });
        return;
      }
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (res.ok) {
          const data = (await res.json()) as Session;
          localStorage.setItem(REFRESH_KEY, data.refreshToken);
          set({ accessToken: data.accessToken, user: data.user, ready: true });
        } else {
          localStorage.removeItem(REFRESH_KEY);
          set({ ready: true });
        }
      } catch {
        set({ ready: true });
      }
    })();
    return bootstrapPromise;
  },
}));

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
