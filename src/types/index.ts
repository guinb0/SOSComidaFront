export type TipoUsuario = 'usuario' | 'instituicao' | 'moderador' | 'admin';
export type StatusAprovacao = 'pendente' | 'aprovada' | 'rejeitada';
export type StatusCampanha = 'pendente' | 'ativa' | 'suspensa' | 'concluida';
export type StatusSolicitacao = 'pendente' | 'aprovada' | 'rejeitada' | 'delegada' | 'aceita' | 'entregue';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  telefone?: string;
  cidade?: string;
  endereco?: string;
  cpf?: string;
  fotoPerfil?: string;
  bio?: string;
  twoFactorEnabled: boolean;
  govBrLinked: boolean;
  dataCriacao: string;
  
  // Instituição
  instituicaoNome?: string;
  instituicaoEndereco?: string;
  instituicaoCep?: string;
  instituicaoTipo?: 'publica' | 'privada';
  instituicaoCnpj?: string;
  statusAprovacao?: StatusAprovacao;
}

export interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  localizacao: string;
  metaVoluntarios: number;
  metaDoacoes: number;
  arrecadado: number;
  imagem: string;
  status: StatusCampanha;
  dataCriacao: string;
  dataFim?: string;
  solicitanteId?: number;
  solicitante?: Usuario;
  instituicaoId?: number;
  instituicaoDelegada?: Usuario;
  numVoluntarios?: number;
  progresso?: number;
}

// DTO para campanhas vindas do backend
export interface CampanhaDto {
  id: number;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  localizacao: string;
  metaArrecadacao: number;
  valorArrecadado: number;
  progresso: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  ativa: boolean;
}

export interface SolicitacaoRecebimento {
  id: number;
  usuarioId: number;
  usuario?: Usuario;
  nome: string;
  telefone: string;
  endereco: string;
  qtdPessoas: number;
  necessidades: string;
  status: StatusSolicitacao;
  dataCriacao: string;
  
  qtdCestas?: number;
  qtdHigiene?: number;
  qtdAbsorventes?: number;
  qtdFraldasInfantis?: number;
  qtdFraldasGeriatricas?: number;
  
  tipoPix?: string;
  chavePix?: string;
  
  cestasEntregues?: number;
  alimentoKgEntregues?: number;
  valorEntregue?: number;
  dataEntregaFinal?: string;
}

export interface SolicitacaoDoacao {
  id: number;
  usuarioId: number;
  usuario?: Usuario;
  tipo: 'monetaria' | 'cesta';
  nomeDoador: string;
  telefone: string;
  endereco: string;
  solicitacaoRecebimentoId?: number;
  recebimentoAssociado?: SolicitacaoRecebimento;
  localEntrega?: string;
  dataEntrega?: string;
  valor?: number;
  status: StatusSolicitacao;
  dataCriacao: string;
}

export interface Delegacao {
  id: number;
  moderadorId: number;
  moderador?: Usuario;
  instituicaoId: number;
  instituicao?: Usuario;
  solicitacaoDoacaoId?: number;
  doacao?: SolicitacaoDoacao;
  solicitacaoRecebimentoId?: number;
  recebimento?: SolicitacaoRecebimento;
  dataDelegacao: string;
  status: 'pendente' | 'aceita' | 'recusada' | 'concluida';
}

export interface VoluntarioCampanha {
  id: number;
  usuarioId: number;
  usuario: Usuario;
  campanhaId: number;
  campanha: Campanha;
  dataInscricao: string;
}

export interface DenunciaVoluntario {
  id: number;
  denuncianteId: number;
  denunciante: Usuario;
  denunciadoId: number;
  denunciado: Usuario;
  campanhaId: number;
  campanha: Campanha;
  motivo: string;
  descricao: string;
  status: 'pendente' | 'resolvida' | 'arquivada';
  dataDenuncia: string;
  moderadorId?: number;
  moderador?: Usuario;
  dataResolucao?: string;
  observacoesModerador?: string;
  acaoTomada?: string;
}

export interface LogAcaoModerador {
  id: number;
  moderadorId: number;
  moderador: Usuario;
  acao: string;
  tipoItem: string;
  itemId: number;
  itemNome?: string;
  dataAcao: string;
  detalhes?: string;
  ipAddress?: string;
}

export interface ParticipanteCampanha {
  id: number;
  usuarioId: number;
  nome: string;
  email: string;
  telefone?: string;
  tipo: string;
  status: string;
  dataEntrada: string;
  dataSaida?: string;
  motivoSaida?: string;
}

export interface MensagemChat {
  id: number;
  campanhaId: number;
  usuarioId: number;
  nomeUsuario: string;
  conteudo: string;
  dataEnvio: string;
  dataEdicao?: string;
  fixada: boolean;
  fixadaPorNome?: string;
}

export interface AvisoCampanha {
  id: number;
  campanhaId: number;
  tituloCampanha?: string;
  moderadorId: number;
  nomeModerador: string;
  destinatarioId?: number;
  nomeDestinatario?: string;
  titulo: string;
  mensagem: string;
  tipo: 'informativo' | 'advertencia' | 'urgente';
  dataEnvio: string;
  lido: boolean;
  dataLeitura?: string;
}