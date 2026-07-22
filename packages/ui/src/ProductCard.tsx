import type { ProductDto } from '@rf/types';

export interface ProductCardProps {
  product: Pick<ProductDto, 'name' | 'slug' | 'description' | 'images'>;
  /** Si es una vista previa (admin), no enlaza a ningún lado. */
  preview?: boolean;
  /**
   * Nombre de view transition para la imagen (portal público con Astro
   * ClientRouter): hace morph de la foto entre la lista y el detalle.
   */
  transitionName?: string;
}

/**
 * Tarjeta de pan compartida entre el portal público y la vista previa del
 * admin. Estilo con variables de marca (--color-*, --font-display) que cada
 * app define, para verse idéntica en ambos lados sin depender de Tailwind.
 */
export function ProductCard({ product, preview = false, transitionName }: ProductCardProps) {
  const cover = product.images[0];
  const inner = (
    <>
      <div
        style={{
          aspectRatio: '4 / 3',
          background: 'var(--color-masa-hondo, #f0e6da)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          ...(transitionName ? { viewTransitionName: transitionName } : {}),
        }}
      >
        {cover ? (
          <img
            src={cover.card}
            alt={product.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: '2.75rem',
              color: 'var(--color-concha, #c15a78)',
              opacity: 0.7,
            }}
            aria-hidden="true"
          >
            {product.name.charAt(0) || '·'}
          </span>
        )}
      </div>
      <div style={{ padding: '0.9rem 1.05rem 1.05rem' }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'var(--color-cafe, #3b2a24)',
          }}
        >
          {product.name}
        </h3>
        {product.description ? (
          <p
            style={{
              margin: '0.35rem 0 0',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              color: 'var(--color-cafe-suave, #6f5b50)',
            }}
          >
            {product.description}
          </p>
        ) : null}
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
    <a href={`/menu/${product.slug}`} style={cardStyle} className="rf-card">
      {inner}
    </a>
  );
}
