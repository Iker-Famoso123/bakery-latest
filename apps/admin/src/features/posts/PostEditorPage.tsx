import type { PostDto, PostStatus } from '@rf/types';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button, Field, Input, PageHeader, Select, Spinner } from '../../components/ui';
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

  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState<Record<string, unknown> | null>(
    (post?.body as Record<string, unknown>) ?? null,
  );
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
    </>
  );
}
