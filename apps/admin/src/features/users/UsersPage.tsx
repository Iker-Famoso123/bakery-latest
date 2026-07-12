import type { Role, UserDto } from '@rf/types';
import { type FormEvent, useState } from 'react';
import { IconPlus, IconX } from '../../components/icons';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
} from '../../components/ui';
import { ApiError } from '../../lib/api';
import { useAuthStore } from '../../stores/auth';
import { toast } from '../../stores/toast';
import { useCreateUser, useSetUserActive, useUsers } from './api';

export function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Usuarios del panel"
        subtitle="Solo por invitación: das de alta a quien administra el sitio."
        action={
          <Button onClick={() => setCreating(true)}>
            <IconPlus className="size-4" /> Nuevo usuario
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid place-items-center py-16 text-concha">
          <Spinner className="size-6" />
        </div>
      ) : !users || users.length === 0 ? (
        <EmptyState title="No hay usuarios todavía" />
      ) : (
        <Card className="divide-y divide-linea">
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </Card>
      )}

      {creating ? <CreateUserModal onClose={() => setCreating(false)} /> : null}
    </>
  );
}

function UserRow({ user }: { user: UserDto }) {
  const me = useAuthStore((s) => s.user);
  const setActive = useSetUserActive();
  const isSelf = me?.id === user.id;

  async function toggle() {
    try {
      await setActive.mutateAsync({ id: user.id, active: !user.active });
      toast.ok(user.active ? 'Usuario desactivado' : 'Usuario activado');
    } catch {
      toast.error('No se pudo cambiar el estado');
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-costra-tenue text-sm font-semibold text-costra">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-cafe">
          {user.name} {isSelf ? <span className="text-xs text-tenue">(tú)</span> : null}
        </p>
        <p className="truncate text-sm text-tenue">{user.email}</p>
      </div>
      <Chip tone={user.role === 'admin' ? 'concha' : 'costra'}>{user.role}</Chip>
      {user.active ? <Chip tone="exito">Activo</Chip> : <Chip tone="neutral">Inactivo</Chip>}
      <Button
        variant="secondary"
        size="sm"
        onClick={toggle}
        disabled={isSelf || setActive.isPending}
        title={isSelf ? 'No puedes desactivarte a ti mismo' : undefined}
      >
        {user.active ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const create = useCreateUser();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('editor');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({ email, name, password, role });
      toast.ok('Usuario creado');
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo crear');
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-cafe/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-crema shadow-xl">
        <div className="flex items-center justify-between border-b border-linea px-4 py-3">
          <p className="font-medium text-cafe">Nuevo usuario</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-cafe-suave hover:bg-masa-hondo">
            <IconX className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </Field>
          <Field label="Correo">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Contraseña" hint="Mínimo 8 caracteres.">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </Field>
          <Field label="Rol">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="editor">Editor (gestiona contenido)</option>
              <option value="admin">Administrador (todo, incluye usuarios)</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creando…' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
