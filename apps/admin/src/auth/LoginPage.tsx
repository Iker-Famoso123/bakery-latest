import type { AuthResponse } from '@rf/types';
import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ConchaMark } from '../components/Brand';
import { Button, Field, Input } from '../components/ui';
import { ApiError, apiPost } from '../lib/api';
import { useAuthStore } from '../stores/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { accessToken, setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (accessToken) return <Navigate to="/avisos" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await apiPost<AuthResponse>('/auth/login', { email, password });
      setSession(session);
      navigate('/avisos');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="anim-rise w-full max-w-sm">
        <div className="overflow-hidden rounded-3xl border border-linea bg-crema shadow-lg">
          {/* Banda de marca */}
          <div className="flex flex-col items-center gap-3 bg-concha px-8 py-9 text-center">
            <ConchaMark className="size-14 text-white" />
            <div>
              <p className="font-display text-2xl leading-tight text-white">Repostería Famoso</p>
              <p className="mt-1 text-sm text-white/80">Panel de administración</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8">
            <Field label="Correo">
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoFocus
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>

            {error ? (
              <p className="rounded-lg bg-peligro-tenue px-3 py-2 text-sm text-peligro">{error}</p>
            ) : null}

            <Button type="submit" disabled={loading} className="mt-1">
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-tenue">
          Acceso solo por invitación. ¿Sin cuenta? Pídele a un administrador que te dé de alta.
        </p>
      </div>
    </div>
  );
}
