import type { PostDto } from '@rf/types';
import { toMexico } from '@rf/types';

export interface PostCardProps {
  post: Pick<PostDto, 'title' | 'slug' | 'coverImage' | 'publishAt' | 'pinned'>;
  preview?: boolean;
}

/**
 * Tarjeta de aviso/entrada compartida entre el portal público y la vista
 * previa del admin. Estilo con variables de marca; sin dependencias de Tailwind.
 */
export function PostCard({ post, preview = false }: PostCardProps) {
  const fecha = toMexico(post.publishAt).setLocale('es').toFormat("d 'de' LLLL yyyy");

  const inner = (
    <>
      <div
        style={{
          aspectRatio: '16 / 9',
          background: 'var(--color-masa-hondo, #f0e6da)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: '2rem',
              color: 'var(--color-concha, #c15a78)',
              opacity: 0.55,
            }}
            aria-hidden="true"
          >
            ✳
          </span>
        )}
      </div>
      <div style={{ padding: '0.9rem 1.05rem 1.1rem' }}>
        {post.pinned ? (
          <span
            style={{
              display: 'inline-block',
              marginBottom: '0.4rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-concha-hondo, #a63f60)',
              background: 'var(--color-concha-tenue, #f6e6ec)',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
            }}
          >
            Fijado
          </span>
        ) : null}
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.2,
            color: 'var(--color-cafe, #3b2a24)',
          }}
        >
          {post.title}
        </h3>
        <time
          dateTime={post.publishAt}
          style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--color-tenue, #9a8677)' }}
        >
          {fecha}
        </time>
      </div>
    </>
  );

  const cardStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    borderRadius: '1rem',
    border: '1px solid var(--color-linea, #ece1d5)',
    background: 'var(--color-crema, #fffdfb)',
    color: 'inherit',
    textDecoration: 'none',
    boxShadow: '0 1px 2px rgba(59,42,36,.05), 0 10px 24px rgba(59,42,36,.05)',
  };

  if (preview) return <article style={cardStyle}>{inner}</article>;
  return (
    <a href={`/blog/${post.slug}`} style={cardStyle} className="rf-card">
      {inner}
    </a>
  );
}
