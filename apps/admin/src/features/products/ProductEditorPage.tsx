import type { ProductDto, ProductImage } from '@rf/types';
import { ProductCard } from '@rf/ui';
import { type FormEvent, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { IconPlus, IconX } from '../../components/icons';
import { Button, Card, Field, Input, PageHeader, Spinner, Textarea } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { toast } from '../../stores/toast';
import { useProduct, useSaveProduct, type ProductInput } from './api';
import { ImageCropper } from './ImageCropper';

export function ProductEditorPage() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);

  if (id && isLoading) {
    return (
      <div className="grid place-items-center py-16 text-concha">
        <Spinner className="size-6" />
      </div>
    );
  }
  return <ProductForm product={product} />;
}

function ProductForm({ product }: { product?: ProductDto }) {
  const navigate = useNavigate();
  const save = useSaveProduct(product?.id);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [precio, setPrecio] = useState(
    product?.details.precioInformativo != null ? String(product.details.precioInformativo) : '',
  );
  const [disponibilidad, setDisponibilidad] = useState(product?.details.disponibilidad ?? '');
  const [ingredientes, setIngredientes] = useState(
    (product?.details.ingredientes ?? []).join(', '),
  );
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: ProductInput = {
      name: name.trim(),
      description: description.trim() || null,
      images,
      active,
      details: {
        ingredientes: ingredientes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        precioInformativo: precio ? Number(precio) : null,
        disponibilidad: disponibilidad.trim() || null,
      },
    };
    try {
      await save.mutateAsync(input);
      toast.ok(product ? 'Pan actualizado' : 'Pan agregado');
      navigate('/menu');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  }

  return (
    <>
      <PageHeader title={product ? 'Editar pan' : 'Nuevo pan'} />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Nombre">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Concha de vainilla"
              required
              autoFocus
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una descripción breve y apetitosa."
            />
          </Field>

          {/* Fotos */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-cafe">Fotos</span>
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div key={img.key} className="relative size-20 overflow-hidden rounded-lg">
                  <img src={img.thumbnail} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((i) => i.key !== img.key))}
                    className="absolute right-1 top-1 rounded-full bg-cafe/70 p-0.5 text-white"
                    aria-label="Quitar foto"
                  >
                    <IconX className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-20 place-items-center rounded-lg border border-dashed border-linea text-tenue hover:border-concha hover:text-concha"
              >
                <IconPlus className="size-6" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPendingFile(f);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio informativo" hint="Opcional. Solo referencia, no se cobra.">
              <Input
                type="number"
                min="0"
                step="0.5"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
              />
            </Field>
            <Field label="Disponibilidad">
              <Input
                value={disponibilidad}
                onChange={(e) => setDisponibilidad(e.target.value)}
                placeholder="Ej. Solo fines de semana"
              />
            </Field>
          </div>

          <Field label="Ingredientes" hint="Sepáralos con comas.">
            <Input
              value={ingredientes}
              onChange={(e) => setIngredientes(e.target.value)}
              placeholder="Harina, azúcar, vainilla"
            />
          </Field>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 accent-[var(--color-concha)]"
            />
            <span className="text-sm text-cafe">Mostrar en el menú público</span>
          </label>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar pan'}
            </Button>
            <Link to="/menu">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>

        {/* Vista previa idéntica al público (reutiliza packages/ui) */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tenue">
            Vista previa
          </p>
          <Card className="overflow-hidden p-3">
            <ProductCard
              preview
              product={{
                name: name || 'Nombre del pan',
                slug: 'preview',
                description: description || null,
                images,
              }}
            />
          </Card>
        </div>
      </div>

      {pendingFile ? (
        <ImageCropper
          file={pendingFile}
          onUploaded={(img) => setImages((prev) => [...prev, img])}
          onClose={() => setPendingFile(null)}
        />
      ) : null}
    </>
  );
}
