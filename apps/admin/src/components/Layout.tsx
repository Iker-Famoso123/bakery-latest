import type { ComponentType, SVGProps } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { apiPost } from '../lib/api';
import { cn } from '../lib/cn';
import { getRefreshToken, useAuthStore } from '../stores/auth';
import { Brand } from './Brand';
import { IconAjustes, IconAvisos, IconLogout, IconMenu, IconUsuarios } from './icons';

interface NavEntry {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
}

const NAV: NavEntry[] = [
  { to: '/avisos', label: 'Avisos', Icon: IconAvisos },
  { to: '/menu', label: 'Menú', Icon: IconMenu },
  { to: '/usuarios', label: 'Usuarios', Icon: IconUsuarios, adminOnly: true },
  { to: '/ajustes', label: 'Ajustes', Icon: IconAjustes, adminOnly: true },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore((s) => s.user?.role);
  return (
    <>
      {NAV.filter((n) => !n.adminOnly || role === 'admin').map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-concha-tenue text-concha-hondo'
                : 'text-cafe-suave hover:bg-masa-hondo hover:text-cafe',
            )
          }
        >
          <Icon className="size-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </>
  );
}

export function Layout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  async function handleLogout() {
    try {
      await apiPost('/auth/logout', { refreshToken: getRefreshToken() });
    } catch {
      /* aunque falle, cerramos localmente */
    }
    useAuthStore.getState().clear();
    navigate('/login');
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar — escritorio */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-linea bg-masa-hondo/50 p-4 md:flex">
        <div className="px-2 py-2">
          <Brand />
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          <NavItems />
        </nav>
        <div className="mt-auto border-t border-linea pt-3">
          <UserBox name={user?.name} role={user?.role} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Barra superior — móvil */}
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-linea bg-masa/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-cafe-suave hover:bg-masa-hondo"
            aria-label="Cerrar sesión"
          >
            <IconLogout className="size-5" />
          </button>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          <NavItems />
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="anim-rise mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function UserBox({
  name,
  role,
  onLogout,
}: {
  name?: string;
  role?: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-9 place-items-center rounded-full bg-concha text-sm font-semibold text-white">
        {(name ?? '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-cafe">{name}</p>
        <p className="text-xs capitalize text-tenue">{role}</p>
      </div>
      <button
        onClick={onLogout}
        className="rounded-lg p-2 text-cafe-suave hover:bg-masa-hondo"
        aria-label="Cerrar sesión"
      >
        <IconLogout className="size-5" />
      </button>
    </div>
  );
}
