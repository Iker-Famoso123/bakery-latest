import type { PostDto, PostStatus } from '@rf/types';
import { slugify } from '@rf/types';
import { PostCard } from '@rf/ui';
import { type FormEvent, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { IconPlus, IconX } from '../../components/icons';
import { ImageCropper } from '../../components/ImageCropper';
import { Button, Card, Field, Input, PageHeader, Select, Spinner } from '../../components/ui';
import { isoToLocalInput, localInputToISO, nowLocalInput } from '../../lib/dates';
import { ApiError } from '../../lib/api';
import { toast } from '../../stores/toast';
import { usePost, useSavePost, type PostInput } from './api';
import { TiptapEditor } from './TiptapEditor';
import { VigenciaField, type Vigencia } from './VigenciaField';

export function PostEditorPage() {
  const { id } = useParams();
  const { data: post, isLoading } = usePost(id);

  if (id && isLoading) {
    return (
      <div className="grid place-items-center py-16 text-concha">
        <Spinner className="size-6" />
      </div>
    );
  }
  return <PostForm post={post} />;
}

function PostForm({ post }: { post?: PostDto }) {
  const navigate = useNavigate();
  const save = useSavePost(post?.id);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState<Record<string, unknown> | null>(
    (post?.body as Record<string, unknown>) ?? null,
  );
  const [coverImage, setCoverImage] = useState<string | null>(post?.coverImage ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'DRAFT');
  const [pinned, setPinned] = useState(post?.pinned ?? false);
  const [publishAt, setPublishAt] = useState(
    post ? isoToLocalInput(post.publishAt) : nowLocalInput(),
  );
  const [mode, setMode] = useState<Vigencia>(post?.expiresAt ? 'temporal' : 'fijo');
  const [expiresAt, setExpiresAt] = useState(
    post?.expiresAt ? isoToLocalInput(post.expiresAt) : '',
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'temporal' && !expiresAt) {
      toast.error('Indica la fecha en que se retira el aviso');
      return;
    }
    const input: PostInput = {
      title: title.trim(),
      body: body ?? { type: 'doc' },
      coverImage,
      status,
      pinned,
      publishAt: localInputToISO(publishAt),
      expiresAt: mode === 'temporal' ? localInputToISO(expiresAt) : null,
    };
    try {
      await save.mutateAsync(input);
      toast.ok(post ? 'Aviso actualizado' : 'Aviso creado');
      navigate('/avisos');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  }

  return (
    <>
      <PageHeader title={post ? 'Editar aviso' : 'Nuevo aviso'} />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Título">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Pan de muerto de temporada"
              required
              autoFocus
            />
          </Field>

          {/* Portada opcional: sin foto, la tarjeta usa el formato de aviso con color */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-cafe">Portada</span>
            {coverImage ? (
              <div className="overflow-hidden rounded-xl border border-linea">
                <img
                  src={coverImage}
                  alt="Portada del aviso"
                  className="aspect-video w-full object-cover"
                />
                <div className="flex items-center justify-end gap-1 border-t border-linea bg-masa/60 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-concha-hondo transition-colors duration-200 hover:bg-concha-tenue"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-cafe-suave transition-colors duration-200 hover:bg-peligro-tenue hover:text-peligro"
                  >
                    <span className="inline-flex items-center gap-1">
                      <IconX className="size-3.5" /> Quitar
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-linea px-4 py-6 text-sm font-medium text-tenue transition-colors duration-200 hover:border-concha hover:text-concha"
              >
                <IconPlus className="size-5" /> Agregar portada
              </button>
            )}
            <span className="text-xs text-tenue">
              Opcional. Sin foto, la tarjeta usa el diseño de aviso con color.
            </span>
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

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-cafe">Contenido</span>
            <TiptapEditor value={body} onChange={setBody} />
          </div>

          <VigenciaField
            publishAt={publishAt}
            onPublishAt={setPublishAt}
            mode={mode}
            onMode={setMode}
            expiresAt={expiresAt}
            onExpiresAt={setExpiresAt}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado">
              <Select value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
                <option value="DRAFT">Borrador (no visible)</option>
                <option value="PUBLISHED">Publicado</option>
              </Select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2.5">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="size-4 accent-[var(--color-concha)]"
              />
              <span className="text-sm text-cafe">Fijar arriba de todo</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar aviso'}
            </Button>
            <Link to="/avisos">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>

        {/* Vista previa idéntica al público (reutiliza packages/ui).
            El slug derivado del título fija el tinte real de la tarjeta sin foto. */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tenue">
            Vista previa
          </p>
          <Card className="overflow-hidden p-3">
            <PostCard
              preview
              post={{
                title: title || 'Título del aviso',
                slug: post?.slug ?? slugify(title || 'aviso'),
                coverImage,
                publishAt: localInputToISO(publishAt || nowLocalInput()),
                pinned,
              }}
            />
          </Card>
        </div>
      </div>

      {pendingFile ? (
        <ImageCropper
          file={pendingFile}
          aspect={16 / 9}
          folder="posts"
          onUploaded={(img) => setCoverImage(img.full)}
          onClose={() => setPendingFile(null)}
        />
      ) : null}
    </>
  );
}
