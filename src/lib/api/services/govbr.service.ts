import axios from 'axios';

const GOVBR_API_URL = 'https://apigateway.conectagov.estaleiro.serpro.gov.br';
const GOVBR_TOKEN_URL = 'https://apigateway.conectagov.estaleiro.serpro.gov.br/oauth2/jwt-token';

export interface GovBrAccount {
  id: string;                    // CPF do cidadão
  name: string;                  // Nome do cidadão
  email: string;                 // Email do cidadão
  emailVerified: string;         // Flag email validado
  phoneNumber: string;           // Número do telefone celular. Ex: "91987479411"
  phoneNumberVerified: string;   // Flag número do telefone celular validado
  status: string;                // Estado
  creationLocalDateTime: string; // Data da criação. Ex: "2020-05-07T21:31:52.635"
}

export interface GovBrConfiabilidade {
  confiabilidade: {
    id: string;
    categoria: string;    // Ex: "bb_internet_banking"
    titulo: string;       // Ex: "internet_banking"
    descricao: string;    // Ex: "Validação através Autenticação no Internet Banking do Banco do Brasil"
  };
  dataCriacao: string;    // Ex: "2020-08-17T10:44:53.179-0300"
  dataAtualizacao: string;
}

export const govbrService = {
  // Obter token de acesso (JWT válido por 2 horas)
  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(GOVBR_TOKEN_URL, null, {
        auth: {
          username: process.env.GOVBR_CLIENT_ID || '',
          password: process.env.GOVBR_CLIENT_SECRET || '',
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Erro ao obter token gov.br:', error);
      throw error;
    }
  },

  // Consultar conta por CPF
  async getAccount(cpf: string, userCpf: string): Promise<GovBrAccount> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${GOVBR_API_URL}/api-govbr-contas/v1/contas/${cpf}`,
        {
          headers: {
            'x-cpf-usuario': userCpf,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar conta gov.br:', error);
      throw error;
    }
  },

  // Consultar confiabilidade por CPF
  async getConfiability(cpf: string, userCpf: string): Promise<GovBrConfiabilidade> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${GOVBR_API_URL}/api-govbr-confiabilidades/v1/confiabilidades/${cpf}`,
        {
          headers: {
            'x-cpf-usuario': userCpf,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar confiabilidade:', error);
      throw error;
    }
  },

  // OAuth2 do gov.br (redirecionar para autenticação)
  redirectToLogin() {
    const clientId = process.env.NEXT_PUBLIC_GOVBR_CLIENT_ID;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Modo de desenvolvimento - redirecionar para simulador
    if (isDevelopment && (!clientId || clientId === 'seu_client_id_aqui')) {
      console.log('Modo desenvolvimento: Redirecionando para simulador gov.br');
      window.location.href = '/auth/govbr/login';
      return;
    }
    
    // Verificar se as credenciais estão configuradas para produção
    if (!clientId || clientId === 'seu_client_id_aqui') {
      throw new Error('Credenciais do gov.br não configuradas. Veja GOVBR_INTEGRATION.md para instruções.');
    }
    
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/govbr/callback');
    const scope = 'openid+profile+email+phone';
    
    // URL correta do Login Único gov.br
    const authUrl = `https://sso.acesso.gov.br/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    window.location.href = authUrl;
  },
};
