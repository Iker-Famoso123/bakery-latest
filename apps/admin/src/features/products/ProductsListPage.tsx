import type { ProductDto } from '@rf/types';
import { Link } from 'react-router';
import { confirm } from '../../components/ConfirmDialog';
import { IconEdit, IconPlus, IconTrash } from '../../components/icons';
import { Button, Card, Chip, EmptyState, PageHeader, Spinner } from '../../components/ui';
import { toast } from '../../stores/toast';
import { useDeleteProduct, useProducts, useReorderProducts } from './api';

export function ProductsListPage() {
  const { data: products, isLoading } = useProducts();
  const reorder = useReorderProducts();
  const del = useDeleteProduct();

  async function move(index: number, dir: -1 | 1) {
    if (!products) return;
    const next = [...products];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    try {
      await reorder.mutateAsync(next.map((p) => p.id));
    } catch {
      toast.error('No se pudo reordenar');
    }
  }

  async function handleDelete(product: ProductDto) {
    const ok = await confirm({
      title: '¿Eliminar este pan?',
      message: `"${product.name}" se quitará del menú público, junto con sus fotos.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await del.mutateAsync(product.id);
      toast.ok('Pan eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <>
      <PageHeader
        title="Menú de panes"
        subtitle="Ordena, edita y muestra los panes del sitio público."
        action={
          <Link to="/menu/nuevo">
            <Button>
              <IconPlus className="size-4" /> Nuevo pan
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid place-items-center py-16 text-concha">
          <Spinner className="size-6" />
        </div>
      ) : !products || products.length === 0 ? (
        <EmptyState title="El menú está vacío" hint="Agrega el primer pan para mostrarlo." />
      ) : (
        <Card className="divide-y divide-linea">
          {products.map((product, i) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || reorder.isPending}
                  className="rounded p-0.5 text-tenue hover:text-concha disabled:opacity-30"
                  aria-label="Subir"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === products.length - 1 || reorder.isPending}
                  className="rounded p-0.5 text-tenue hover:text-concha disabled:opacity-30"
                  aria-label="Bajar"
                >
                  ▼
                </button>
              </div>

              <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-masa-hondo">
                {product.images[0] ? (
                  <img
                    src={product.images[0].thumbnail}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cafe">{product.name}</p>
                <div className="mt-0.5">
                  {product.active ? (
                    <Chip tone="exito">Visible</Chip>
                  ) : (
                    <Chip tone="neutral">Oculto</Chip>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to={`/menu/${product.id}`}
                  className="rounded-lg p-2 text-cafe-suave hover:bg-masa-hondo"
                  aria-label="Editar"
                >
                  <IconEdit className="size-5" />
                </Link>
                <button
                  onClick={() => handleDelete(product)}
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
