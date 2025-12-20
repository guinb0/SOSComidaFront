import apiClient from '../client';
import { Campanha } from '@/types';

export interface CreateCampanhaDto {
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  metaArrecadacao: number;
  dataInicio: string;
  dataFim: string;
}

export interface UpdateCampanhaDto extends CreateCampanhaDto {
  id: number;
  status: string;
  ativo: boolean;
}

export const campanhaService = {
  getAll: async (): Promise<{ data: Campanha[]; total: number }> => {
    const response = await apiClient.get('/api/campanhas');
    return response.data;
  },

  getById: async (id: number): Promise<Campanha> => {
    const response = await apiClient.get(`/api/campanhas/${id}`);
    return response.data;
  },

  getByUsuario: async (usuarioId: number): Promise<{ data: Campanha[]; total: number }> => {
    const response = await apiClient.get(`/api/campanhas/usuario/${usuarioId}`);
    return response.data;
  },

  create: async (data: CreateCampanhaDto): Promise<Campanha> => {
    const response = await apiClient.post('/api/campanhas', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCampanhaDto): Promise<void> => {
    await apiClient.put(`/api/campanhas/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/campanhas/${id}`);
  },

  doar: async (id: number, valor: number): Promise<{ message: string; valorArrecadado: number; percentual: number }> => {
    const response = await apiClient.post(`/api/campanhas/${id}/doar`, valor);
    return response.data;
  },
};
