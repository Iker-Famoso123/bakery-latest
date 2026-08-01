import Image from '@tiptap/extension-image';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef, type ReactNode } from 'react';
import { IconImagen } from '../../components/icons';
import { Spinner } from '../../components/ui';
import { ApiError } from '../../lib/api';
import { cn } from '../../lib/cn';
import { useUploadImage } from '../../lib/media';
import { toast } from '../../lib/toast';

interface Props {
  value: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
}

function ToolButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-8 min-w-8 place-items-center rounded-md px-2 text-sm font-semibold transition',
        'disabled:pointer-events-none disabled:opacity-50',
        active ? 'bg-concha-tenue text-concha-hondo' : 'text-cafe-suave hover:bg-masa-hondo',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();

  /**
   * Imagen dentro del contenido: se sube completa (recorte = imagen entera,
   * sin proporción forzada), sharp genera las variantes y se inserta la
   * versión `full` en el cursor.
   */
  async function insertarImagen(file: File) {
    try {
      const bitmap = await createImageBitmap(file);
      const crop = { x: 0, y: 0, width: bitmap.width, height: bitmap.height };
      bitmap.close();
      const img = await upload.mutateAsync({ file, crop, folder: 'posts' });
      editor.chain().focus().setImage({ src: img.full, alt: '' }).run();
      toast.ok('Imagen insertada');
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        toast.error('Configura R2 en la API para poder subir fotos');
      } else {
        toast.error(err instanceof ApiError ? err.message : 'No se pudo subir la imagen');
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-linea px-2 py-1.5">
      <ToolButton
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Negritas"
      >
        <span className="font-bold">B</span>
      </ToolButton>
      <ToolButton
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Cursivas"
      >
        <span className="italic">I</span>
      </ToolButton>
      <ToolButton
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Subtítulo"
      >
        H
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-linea" />
      <ToolButton
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Lista con viñetas"
      >
        • Lista
      </ToolButton>
      <ToolButton
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Lista numerada"
      >
        1. Lista
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-linea" />
      <ToolButton
        onClick={() => fileRef.current?.click()}
        disabled={upload.isPending}
        label="Insertar imagen"
      >
        {upload.isPending ? <Spinner className="size-4" /> : <IconImagen className="size-4.5" />}
      </ToolButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void insertarImagen(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value ?? '',
    editorProps: { attributes: { class: 'prosa min-h-40 px-3 py-2 text-cafe' } },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Record<string, unknown>),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-linea bg-crema">
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
