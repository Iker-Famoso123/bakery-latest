import type { Horario, SettingsDto, SocialLink } from '@rf/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../../lib/api';

export interface SettingsInput {
  whatsapp: string | null;
  telefono: string | null;
  direccion: string | null;
  lat: number | null;
  lng: number | null;
  redes: SocialLink[];
  horarios: Horario[];
}

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => apiGet<SettingsDto>('/public/settings') });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsInput) => apiPut<SettingsDto>('/settings', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
