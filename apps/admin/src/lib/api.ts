import { getRefreshToken, useAuthStore } from '../stores/auth';
import { API_BASE } from './config';

const BASE = API_BASE;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// Un único refresco en vuelo compartido entre peticiones concurrentes.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    useAuthStore.getState().clear();
    return null;
  }
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    useAuthStore.getState().clear();
    return null;
  }
  const data = await res.json();
  useAuthStore.getState().setSession(data);
  return data.accessToken as string;
}

interface Options extends RequestInit {
  retry?: boolean;
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { retry = true, ...init } = options;
  const token = useAuthStore.getState().accessToken;

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // Access token vencido → intenta refrescar una vez y reintenta.
  if (res.status === 401 && retry) {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const newToken = await refreshing;
    if (newToken) return api<T>(path, { ...options, retry: false });
    throw new ApiError(401, 'Tu sesión expiró, vuelve a entrar');
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string) => api<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const apiPatch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const apiPut = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = <T>(path: string) => api<T>(path, { method: 'DELETE' });
export const apiUpload = <T>(path: string, form: FormData) =>
  api<T>(path, { method: 'POST', body: form });
