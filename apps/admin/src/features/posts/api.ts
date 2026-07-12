import type { Paginated, PostDto, PostStatus } from '@rf/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api';

export interface PostInput {
  title: string;
  body: Record<string, unknown>;
  status: PostStatus;
  publishAt: string;
  expiresAt: string | null;
  pinned: boolean;
}

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiGet<Paginated<PostDto>>('/posts?limit=50'),
  });
}

export function usePost(id?: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => apiGet<PostDto>(`/posts/${id}`),
    enabled: Boolean(id),
  });
}

export function useSavePost(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) =>
      id ? apiPatch<PostDto>(`/posts/${id}`, input) : apiPost<PostDto>('/posts', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}
