import type { Role, UserDto } from '@rf/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '../../lib/api';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: () => apiGet<UserDto[]>('/users') });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => apiPost<UserDto>('/users', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiPatch<UserDto>(`/users/${id}/active`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
