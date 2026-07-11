import type { ProductDto } from '@rf/types';

export interface ProductCardProps {
  product: Pick<ProductDto, 'name' | 'slug' | 'description' | 'images'>;
}

/**
 * Tarjeta de pan compartida entre público y preview del admin.
 * (Estilos reales en la Fase 3/4; esto es el esqueleto para validar el wiring.)
 */
export function ProductCard({ product }: ProductCardProps) {
  const cover = product.images[0];
  return (
    <article className="rf-product-card">
      {cover ? <img src={cover.card} alt={product.name} loading="lazy" /> : null}
      <h3>{product.name}</h3>
      {product.description ? <p>{product.description}</p> : null}
    </article>
  );
}
