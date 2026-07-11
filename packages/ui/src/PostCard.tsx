import type { PostDto } from '@rf/types';
import { toMexico } from '@rf/types';

export interface PostCardProps {
  post: Pick<PostDto, 'title' | 'slug' | 'coverImage' | 'publishAt' | 'pinned'>;
}

/**
 * Tarjeta de post compartida. Astro la monta como isla en el portal público
 * y el admin la reutiliza para la vista previa, así el preview es idéntico.
 * (Estilos reales en la Fase 3/4; esto es el esqueleto para validar el wiring.)
 */
export function PostCard({ post }: PostCardProps) {
  const fecha = toMexico(post.publishAt).toFormat("d 'de' LLLL yyyy");
  return (
    <article className="rf-post-card">
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} loading="lazy" />
      ) : null}
      <h3>
        {post.pinned ? '📌 ' : ''}
        <a href={`/blog/${post.slug}`}>{post.title}</a>
      </h3>
      <time dateTime={post.publishAt}>{fecha}</time>
    </article>
  );
}
