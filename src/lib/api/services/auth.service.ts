import apiClient from '../client';
import { Usuario } from '@/types';

export interface LoginRequest {
  email: string;
  senha: string;
  codigo2fa?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  usuario: Usuario;
  requires2FA?: boolean;
}

export interface RegisterUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  endereco: string;
  cidade: string;
  cpf: string;
}

export interface RegisterInstituicaoRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  endereco: string;
  cep: string;
  tipoInstituicao: 'publica' | 'privada';
}

export interface Setup2FAResponse {
  qrCode: string;
  secret: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  registerUsuario: async (data: RegisterUsuarioRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register/usuario', data);
    return response.data;
  },

  registerInstituicao: async (data: RegisterInstituicaoRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register/instituicao', data);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async (): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>('/auth/me');
    return response.data;
  },

  setup2FA: async (): Promise<Setup2FAResponse> => {
    const response = await apiClient.post<Setup2FAResponse>('/auth/2fa/setup');
    return response.data;
  },

  enable2FA: async (codigo: string): Promise<void> => {
    await apiClient.post('/auth/2fa/enable', { codigo });
  },

  disable2FA: async (codigo: string): Promise<void> => {
    await apiClient.post('/auth/2fa/disable', { codigo });
  },

  verify2FA: async (codigo: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/2fa/verify', { codigo });
    return response.data;
  },

  updateProfile: async (data: Partial<Usuario>): Promise<Usuario> => {
    const response = await apiClient.put<Usuario>('/auth/profile', data);
    return response.data;
  },
};