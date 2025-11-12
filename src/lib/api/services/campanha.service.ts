import apiClient from '../client';
import { Campanha, VoluntarioCampanha, DenunciaVoluntario } from '@/types';

export interface CreateCampanhaRequest {
  titulo: string;
  descricao: string;
  localizacao: string;
  metaVoluntarios: number;
  metaDoacoes: number;
  imagem?: File;
}

export interface DenunciarVoluntarioRequest {
  denunciadoId: number;
  campanhaId: number;
  motivo: string;
  descricao: string;
}

export const campanhaService = {
  getAll: async (status?: string): Promise<Campanha[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<Campanha[]>('/campanhas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Campanha> => {
    const response = await apiClient.get<Campanha>(`/campanhas/${id}`);
    return response.data;
  },

  create: async (data: CreateCampanhaRequest): Promise<Campanha> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await apiClient.post<Campanha>('/campanhas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, data: Partial<CreateCampanhaRequest>): Promise<Campanha> => {
    const response = await apiClient.put<Campanha>(`/campanhas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/campanhas/${id}`);
  },

  voluntariar: async (campanhaId: number): Promise<void> => {
    await apiClient.post(`/campanhas/${campanhaId}/voluntariar`);
  },

  getVoluntarios: async (campanhaId: number): Promise<VoluntarioCampanha[]> => {
    const response = await apiClient.get<VoluntarioCampanha[]>(`/campanhas/${campanhaId}/voluntarios`);
    return response.data;
  },

  denunciarVoluntario: async (data: DenunciarVoluntarioRequest): Promise<DenunciaVoluntario> => {
    const response = await apiClient.post<DenunciaVoluntario>('/denuncias/voluntario', data);
    return response.data;
  },

  doarPix: async (campanhaId: number, valor: number): Promise<void> => {
    await apiClient.post(`/campanhas/${campanhaId}/doar-pix`, { valor });
  },

  doarItens: async (campanhaId: number, itens: {
    qtdCestas?: number;
    qtdHigiene?: number;
    qtdAgua?: number;
    qtdFraldasInfantis?: number;
  }): Promise<void> => {
    await apiClient.post(`/campanhas/${campanhaId}/doar-itens`, itens);
  },
};