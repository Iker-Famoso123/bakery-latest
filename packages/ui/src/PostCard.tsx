import type { PostDto } from '@rf/types';
import { toMexico } from '@rf/types';

export interface PostCardProps {
  post: Pick<PostDto, 'title' | 'slug' | 'coverImage' | 'publishAt' | 'pinned'>;
  preview?: boolean;
  /**
   * Nombre de view transition para la portada (portal público con Astro
   * ClientRouter): hace morph de la imagen entre la lista y el detalle.
   */
  transitionName?: string;
}

/** Dos baños de color para tarjetas sin foto; se elige por slug (estable). */
const TINTES = [
  { fondo: 'var(--color-concha-tenue, #f6e6ec)', marca: 'var(--color-concha, #c15a78)' },
  { fondo: 'var(--color-costra-tenue, #f4e8d6)', marca: 'var(--color-costra, #b27a3e)' },
] as const;

function tinteDe(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTES[h % TINTES.length]!;
}

const CROISSANT_MASK = '/brand/croissant.png';

/**
 * Marca de agua: el croissant del logotipo formal, teñido vía CSS mask.
 * El PNG vive en /public/brand de ambas apps (público y admin).
 */
function CroissantMarca({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: '-2.4rem',
        bottom: '-1.6rem',
        width: '11rem',
        height: '8.5rem',
        backgroundColor: color,
        opacity: 0.28,
        WebkitMaskImage: `url(${CROISSANT_MASK})`,
        maskImage: `url(${CROISSANT_MASK})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        pointerEvents: 'none',
      }}
    />
  );
}

function ChipFijado() {
  return (
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
  );
}

/**
 * Tarjeta de aviso/entrada compartida entre el portal público y la vista
 * previa del admin. Estilo con variables de marca; sin dependencias de Tailwind.
 *
 * Con foto: portada 16:9 + texto. Sin foto: tarjeta de texto compacta con
 * baño de color cálido, título display más grande y la concha de marca de
 * agua — la ausencia de imagen es un formato, no un hueco.
 */
export function PostCard({ post, preview = false, transitionName }: PostCardProps) {
  const fecha = toMexico(post.publishAt).setLocale('es').toFormat("d 'de' LLLL yyyy");
  const fechaEl = (
    <time
      dateTime={post.publishAt}
      style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--color-tenue, #9a8677)' }}
    >
      {fecha}
    </time>
  );

  let inner: React.ReactNode;
  let fondo = 'var(--color-crema, #fffdfb)';

  if (post.coverImage) {
    inner = (
      <>
        <div
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--color-masa-hondo, #f0e6da)',
            overflow: 'hidden',
            ...(transitionName ? { viewTransitionName: transitionName } : {}),
          }}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ padding: '0.9rem 1.05rem 1.1rem' }}>
          {post.pinned ? <ChipFijado /> : null}
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
          {fechaEl}
        </div>
      </>
    );
  } else {
    const tinte = tinteDe(post.slug);
    fondo = `linear-gradient(150deg, var(--color-crema, #fffdfb) 15%, ${tinte.fondo} 110%)`;
    inner = (
      <div
        style={{
          position: 'relative',
          // Llena la tarjeta aunque el grid la estire junto a tarjetas con
          // foto: el título se ancla abajo y la concha vive en la esquina.
          height: '100%',
          boxSizing: 'border-box',
          minHeight: '9.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.5rem 1.25rem 1.15rem',
          /* Sin foto no hay morph al detalle: el transitionName no aplica aquí. */
        }}
      >
        <CroissantMarca color={tinte.marca} />
        <div style={{ position: 'relative' }}>
          {post.pinned ? <ChipFijado /> : null}
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: '1.45rem',
              fontWeight: 600,
              lineHeight: 1.18,
              color: 'var(--color-cafe, #3b2a24)',
              textWrap: 'balance',
            }}
          >
            {post.title}
          </h3>
          {fechaEl}
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    borderRadius: '1rem',
    border: '1px solid var(--color-linea, #ece1d5)',
    background: fondo,
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
