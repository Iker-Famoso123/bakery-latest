import { motion, useReducedMotion } from 'motion/react';
import type { ComponentType, SVGProps } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
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

const NAV_SPRING = { type: 'spring', stiffness: 480, damping: 38 } as const;

function useVisibleNav() {
  const role = useAuthStore((s) => s.user?.role);
  return NAV.filter((n) => !n.adminOnly || role === 'admin');
}

/** Nav lateral de escritorio: la píldora activa se desliza entre entradas. */
function SidebarNav() {
  const entries = useVisibleNav();
  return (
    <nav className="mt-6 flex flex-col gap-1">
      {entries.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="relative rounded-lg px-3 py-2 text-sm font-medium outline-offset-0"
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <motion.span
                  layoutId="nav-pill-desktop"
                  className="absolute inset-0 rounded-lg bg-concha-tenue"
                  transition={NAV_SPRING}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-10 flex items-center gap-3 transition-colors duration-200',
                  isActive ? 'text-concha-hondo' : 'text-cafe-suave hover:text-cafe',
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/** Tab bar inferior en móvil, estilo app de iOS. */
function TabBar() {
  const entries = useVisibleNav();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-masa/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Navegación principal"
    >
      <div
        className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${entries.length}, 1fr)` }}
      >
        {entries.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium"
          >
            {({ isActive }) => (
              <>
                <span className="relative grid h-7 w-14 place-items-center">
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill-mobile"
                      className="absolute inset-0 rounded-full bg-concha-tenue"
                      transition={NAV_SPRING}
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      'relative z-10 size-5 transition-colors duration-200',
                      isActive ? 'text-concha-hondo' : 'text-cafe-suave',
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-concha-hondo' : 'text-cafe-suave',
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const reduceMotion = useReducedMotion();

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
        <SidebarNav />
        <div className="mt-auto border-t border-linea pt-3">
          <UserBox name={user?.name} role={user?.role} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Barra superior — móvil */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-linea bg-masa/85 px-4 py-3 backdrop-blur-xl md:hidden">
        <Brand />
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-cafe-suave transition-colors duration-200 hover:bg-masa-hondo"
          aria-label="Cerrar sesión"
        >
          <IconLogout className="size-5" />
        </button>
      </header>

      <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:py-8">
        {/* Cada ruta entra con un leve rise+fade; sin animación de salida para no retrasar la navegación. */}
        <motion.div
          key={location.pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="mx-auto max-w-4xl"
        >
          <Outlet />
        </motion.div>
      </main>

      <TabBar />
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
        className="rounded-lg p-2 text-cafe-suave transition-colors duration-200 hover:bg-masa-hondo"
        aria-label="Cerrar sesión"
      >
        <IconLogout className="size-5" />
      </button>
    </div>
  );
}
