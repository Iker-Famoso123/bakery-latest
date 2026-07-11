import { PostCard } from '@rf/ui';
import { nowISO } from '@rf/types';

/**
 * Scaffold de Fase 1: solo valida que el admin monta React 19 y consume
 * `@rf/ui` + `@rf/types`. El auth flow, rutas y editor llegan en la Fase 3.
 */
export function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Repostería Famoso · Panel</h1>
      <p>Scaffold de Fase 1 · {nowISO()}</p>
      <PostCard
        post={{
          title: 'Post de ejemplo',
          slug: 'ejemplo',
          coverImage: null,
          publishAt: nowISO(),
          pinned: true,
        }}
      />
    </main>
  );
}
