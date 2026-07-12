import type { PostDto } from '@rf/types';
import { fromISO, now } from '@rf/types';
import { Link } from 'react-router';
import { IconEdit, IconInfinity, IconPin, IconPlus, IconTrash } from '../../components/icons';
import { Button, Card, Chip, EmptyState, PageHeader, Spinner } from '../../components/ui';
import { formatDate } from '../../lib/dates';
import { toast } from '../../stores/toast';
import { useDeletePost, usePosts } from './api';

function StatusChip({ post }: { post: PostDto }) {
  if (post.status === 'DRAFT') return <Chip tone="neutral">Borrador</Chip>;
  if (fromISO(post.publishAt) > now()) return <Chip tone="costra">Programado</Chip>;
  return <Chip tone="exito">Publicado</Chip>;
}

export function PostsListPage() {
  const { data, isLoading } = usePosts();
  const del = useDeletePost();

  async function handleDelete(post: PostDto) {
    if (!window.confirm(`¿Eliminar el aviso "${post.title}"?`)) return;
    try {
      await del.mutateAsync(post.id);
      toast.ok('Aviso eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <>
      <PageHeader
        title="Avisos"
        subtitle="Publicaciones del blog y avisos con vigencia."
        action={
          <Link to="/avisos/nuevo">
            <Button>
              <IconPlus className="size-4" /> Nuevo aviso
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid place-items-center py-16 text-concha">
          <Spinner className="size-6" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="Aún no hay avisos"
          hint="Crea el primero para que aparezca en el sitio público."
        />
      ) : (
        <Card className="divide-y divide-linea">
          {data.items.map((post) => (
            <div key={post.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {post.pinned ? <IconPin className="size-4 text-concha" /> : null}
                  <p className="truncate font-medium text-cafe">{post.title}</p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-tenue">
                  <StatusChip post={post} />
                  <span className="inline-flex items-center gap-1">
                    {post.expiresAt ? (
                      <>Vigente hasta {formatDate(post.expiresAt)}</>
                    ) : (
                      <>
                        <IconInfinity className="size-3.5" /> Permanente
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to={`/avisos/${post.id}`}
                  className="rounded-lg p-2 text-cafe-suave hover:bg-masa-hondo"
                  aria-label="Editar"
                >
                  <IconEdit className="size-5" />
                </Link>
                <button
                  onClick={() => handleDelete(post)}
                  className="rounded-lg p-2 text-cafe-suave hover:bg-peligro-tenue hover:text-peligro"
                  aria-label="Eliminar"
                >
                  <IconTrash className="size-5" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
