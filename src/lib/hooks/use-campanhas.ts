import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campanhaService, CreateCampanhaDto, UpdateCampanhaDto } from '@/lib/api/services/campanha-nova.service';

export function useCampanhas() {
  return useQuery({
    queryKey: ['campanhas'],
    queryFn: campanhaService.getAll,
  });
}

export function useCampanha(id: number) {
  return useQuery({
    queryKey: ['campanha', id],
    queryFn: () => campanhaService.getById(id),
    enabled: !!id,
  });
}

export function useCampanhasByUsuario(usuarioId: number) {
  return useQuery({
    queryKey: ['campanhas', 'usuario', usuarioId],
    queryFn: () => campanhaService.getByUsuario(usuarioId),
    enabled: !!usuarioId,
  });
}

export function useCreateCampanha() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campanhaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
    },
  });
}

export function useUpdateCampanha() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCampanhaDto }) =>
      campanhaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
    },
  });
}

export function useDeleteCampanha() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campanhaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
    },
  });
}

export function useDoarCampanha() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, valor }: { id: number; valor: number }) =>
      campanhaService.doar(id, valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
    },
  });
}
