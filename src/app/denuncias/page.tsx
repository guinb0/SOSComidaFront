'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  Flag, 
  ArrowLeft,
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Eye,
  Ban,
  ShieldCheck,
  Filter
} from 'lucide-react';

type StatusDenuncia = 'pendente' | 'analisando' | 'procedente' | 'improcedente';
type TipoDenuncia = 'fraude' | 'conteudo_inapropriado' | 'informacao_falsa' | 'spam' | 'outro';

interface Denuncia {
  id: number;
  tipo: TipoDenuncia;
  descricao: string;
  campanhaId: number;
  campanhaTitulo: string;
  denuncianteId: number;
  denuncianteNome: string;
  denuncianteEmail: string;
  dataDenuncia: string;
  status: StatusDenuncia;
  moderadorId?: number;
  moderadorNome?: string;
  dataAnalise?: string;
  observacaoModerador?: string;
}

// Mock de denúncias
const mockDenuncias: Denuncia[] = [
  {
    id: 1,
    tipo: 'fraude',
    descricao: 'Acredito que esta campanha seja fraudulenta. Os dados do responsável não conferem e as fotos parecem ser de outra instituição.',
    campanhaId: 1,
    campanhaTitulo: 'Ajude a Família Silva',
    denuncianteId: 5,
    denuncianteNome: 'Carlos Mendes',
    denuncianteEmail: 'carlos@email.com',
    dataDenuncia: '2025-12-12T14:30:00',
    status: 'pendente',
  },
  {
    id: 2,
    tipo: 'informacao_falsa',
    descricao: 'A localização informada não existe. Já fui verificar e não há nenhuma família naquele endereço.',
    campanhaId: 2,
    campanhaTitulo: 'Cesta Básica para Idosos',
    denuncianteId: 8,
    denuncianteNome: 'Ana Paula',
    denuncianteEmail: 'ana@email.com',
    dataDenuncia: '2025-12-11T09:15:00',
    status: 'pendente',
  },
  {
    id: 3,
    tipo: 'conteudo_inapropriado',
    descricao: 'A descrição da campanha contém linguagem ofensiva e inadequada.',
    campanhaId: 5,
    campanhaTitulo: 'Campanha Solidária',
    denuncianteId: 12,
    denuncianteNome: 'Roberto Lima',
    denuncianteEmail: 'roberto@email.com',
    dataDenuncia: '2025-12-10T16:45:00',
    status: 'analisando',
    moderadorId: 1,
    moderadorNome: 'Guilherme (Super)',
  },
  {
    id: 4,
    tipo: 'spam',
    descricao: 'Mesmo usuário criou várias campanhas idênticas.',
    campanhaId: 8,
    campanhaTitulo: 'Doação Urgente',
    denuncianteId: 3,
    denuncianteNome: 'Mariana Costa',
    denuncianteEmail: 'mariana@email.com',
    dataDenuncia: '2025-12-09T11:20:00',
    status: 'pendente',
  },
  {
    id: 5,
    tipo: 'fraude',
    descricao: 'O responsável pela campanha está usando fotos de stock da internet.',
    campanhaId: 3,
    campanhaTitulo: 'Alimentos para Creche',
    denuncianteId: 15,
    denuncianteNome: 'Fernando Alves',
    denuncianteEmail: 'fernando@email.com',
    dataDenuncia: '2025-12-08T08:00:00',
    status: 'procedente',
    moderadorId: 1,
    moderadorNome: 'Guilherme (Super)',
    dataAnalise: '2025-12-09T10:30:00',
    observacaoModerador: 'Confirmado uso de imagens falsas. Campanha removida e usuário banido.',
  },
  {
    id: 6,
    tipo: 'outro',
    descricao: 'A campanha já atingiu a meta mas continua recebendo doações sem justificativa.',
    campanhaId: 6,
    campanhaTitulo: 'Ajuda Emergencial',
    denuncianteId: 20,
    denuncianteNome: 'Paula Santos',
    denuncianteEmail: 'paula@email.com',
    dataDenuncia: '2025-12-07T13:45:00',
    status: 'improcedente',
    moderadorId: 1,
    moderadorNome: 'Guilherme (Super)',
    dataAnalise: '2025-12-08T09:00:00',
    observacaoModerador: 'A campanha informou que expandiu o escopo para ajudar mais famílias. Procedimento válido.',
  },
  {
    id: 7,
    tipo: 'informacao_falsa',
    descricao: 'Os valores de arrecadação parecem manipulados.',
    campanhaId: 10,
    campanhaTitulo: 'Natal Solidário',
    denuncianteId: 25,
    denuncianteNome: 'Ricardo Nunes',
    denuncianteEmail: 'ricardo@email.com',
    dataDenuncia: '2025-12-06T17:30:00',
    status: 'pendente',
  },
];

export default function DenunciasPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [denuncias, setDenuncias] = useState<Denuncia[]>(mockDenuncias);
  const [filtroStatus, setFiltroStatus] = useState<StatusDenuncia | 'todas'>('todas');
  const [filtroTipo, setFiltroTipo] = useState<TipoDenuncia | 'todos'>('todos');
  const [denunciaSelecionada, setDenunciaSelecionada] = useState<Denuncia | null>(null);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const isAdminOrModerador = user.tipo === 'admin' || user.tipo === 'moderador';
    if (!isAdminOrModerador) {
      alert('Acesso negado. Apenas administradores e moderadores podem acessar esta página.');
      router.push('/inicio');
      return;
    }
  }, [user, router]);

  const getTipoLabel = (tipo: TipoDenuncia): string => {
    const labels: Record<TipoDenuncia, string> = {
      fraude: 'Fraude',
      conteudo_inapropriado: 'Conteúdo Inapropriado',
      informacao_falsa: 'Informação Falsa',
      spam: 'Spam',
      outro: 'Outro',
    };
    return labels[tipo];
  };

  const getTipoColor = (tipo: TipoDenuncia): string => {
    const colors: Record<TipoDenuncia, string> = {
      fraude: 'bg-red-600 text-white',
      conteudo_inapropriado: 'bg-orange-600 text-white',
      informacao_falsa: 'bg-amber-600 text-white',
      spam: 'bg-purple-600 text-white',
      outro: 'bg-slate-600 text-white',
    };
    return colors[tipo];
  };

  const getStatusColor = (status: StatusDenuncia): string => {
    const colors: Record<StatusDenuncia, string> = {
      pendente: 'bg-amber-100 text-amber-700 border-amber-300',
      analisando: 'bg-blue-100 text-blue-700 border-blue-300',
      procedente: 'bg-red-100 text-red-700 border-red-300',
      improcedente: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    };
    return colors[status];
  };

  const getStatusLabel = (status: StatusDenuncia): string => {
    const labels: Record<StatusDenuncia, string> = {
      pendente: 'Pendente',
      analisando: 'Em Análise',
      procedente: 'Procedente',
      improcedente: 'Improcedente',
    };
    return labels[status];
  };

  const getStatusIcon = (status: StatusDenuncia) => {
    switch (status) {
      case 'pendente':
        return <AlertTriangle size={16} />;
      case 'analisando':
        return <Eye size={16} />;
      case 'procedente':
        return <Ban size={16} />;
      case 'improcedente':
        return <ShieldCheck size={16} />;
    }
  };

  const iniciarAnalise = (denuncia: Denuncia) => {
    setDenuncias(prev =>
      prev.map(d =>
        d.id === denuncia.id
          ? { ...d, status: 'analisando' as StatusDenuncia, moderadorId: 1, moderadorNome: user?.nome }
          : d
      )
    );
  };

  const finalizarAnalise = (denunciaId: number, procedente: boolean) => {
    if (!observacao.trim()) {
      alert('Por favor, adicione uma observação sobre a análise.');
      return;
    }

    setDenuncias(prev =>
      prev.map(d =>
        d.id === denunciaId
          ? {
              ...d,
              status: procedente ? 'procedente' : 'improcedente',
              dataAnalise: new Date().toISOString(),
              observacaoModerador: observacao,
            }
          : d
      )
    );
    setDenunciaSelecionada(null);
    setObservacao('');
    alert(`Denúncia marcada como ${procedente ? 'PROCEDENTE' : 'IMPROCEDENTE'}.`);
  };

  const denunciasFiltradas = denuncias.filter(d => {
    const matchStatus = filtroStatus === 'todas' || d.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || d.tipo === filtroTipo;
    return matchStatus && matchTipo;
  });

  const estatisticas = {
    total: denuncias.length,
    pendentes: denuncias.filter(d => d.status === 'pendente').length,
    analisando: denuncias.filter(d => d.status === 'analisando').length,
    procedentes: denuncias.filter(d => d.status === 'procedente').length,
    improcedentes: denuncias.filter(d => d.status === 'improcedente').length,
  };

  const isAdminOrModerador = user?.tipo === 'admin' || user?.tipo === 'moderador';
  if (!user || !isAdminOrModerador) {
    return null;
  }

  return (
    <div className="flex min-h-screen theme-bg-primary">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/moderacao')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para Moderação
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Flag className="text-red-500" size={32} />
              <h1 className="text-3xl font-bold theme-text-primary">Denúncias</h1>
            </div>
            <p className="theme-text-secondary">
              Revise e analise as denúncias de campanhas reportadas pelos usuários
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-sm mb-1">Total</div>
              <div className="text-2xl font-bold text-slate-800">{estatisticas.total}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-amber-600 text-sm mb-1">Pendentes</div>
              <div className="text-2xl font-bold text-amber-600">{estatisticas.pendentes}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-blue-600 text-sm mb-1">Em Análise</div>
              <div className="text-2xl font-bold text-blue-600">{estatisticas.analisando}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-red-600 text-sm mb-1">Procedentes</div>
              <div className="text-2xl font-bold text-red-600">{estatisticas.procedentes}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-emerald-600 text-sm mb-1">Improcedentes</div>
              <div className="text-2xl font-bold text-emerald-600">{estatisticas.improcedentes}</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-500" />
                <span className="text-slate-500 text-sm">Filtros:</span>
              </div>
              
              {/* Filtro por Status */}
              <div className="flex flex-wrap gap-2">
                {(['todas', 'pendente', 'analisando', 'procedente', 'improcedente'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filtroStatus === status
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'todas' ? 'Todos Status' : getStatusLabel(status)}
                  </button>
                ))}
              </div>

              {/* Filtro por Tipo */}
              <div className="flex flex-wrap gap-2">
                {(['todos', 'fraude', 'informacao_falsa', 'conteudo_inapropriado', 'spam', 'outro'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setFiltroTipo(tipo)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filtroTipo === tipo
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tipo === 'todos' ? 'Todos Tipos' : getTipoLabel(tipo)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Denúncias */}
          <div className="space-y-4">
            {denunciasFiltradas.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm text-center">
                <Flag size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhuma denúncia encontrada com os filtros selecionados.</p>
              </div>
            ) : (
              denunciasFiltradas.map((denuncia) => (
                <div
                  key={denuncia.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Info Principal */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(denuncia.tipo)}`}>
                            {getTipoLabel(denuncia.tipo)}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(denuncia.status)}`}>
                            {getStatusIcon(denuncia.status)}
                            {getStatusLabel(denuncia.status)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          Campanha: {denuncia.campanhaTitulo}
                        </h3>
                        
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                          {denuncia.descricao}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {denuncia.denuncianteNome}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(denuncia.dataDenuncia).toLocaleDateString('pt-BR')}
                          </span>
                          {denuncia.moderadorNome && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <ShieldCheck size={12} />
                              Moderador: {denuncia.moderadorNome}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        {denuncia.status === 'pendente' && (
                          <button
                            onClick={() => {
                              iniciarAnalise(denuncia);
                              setDenunciaSelecionada(denuncia);
                            }}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            Analisar
                          </button>
                        )}
                        {denuncia.status === 'analisando' && (
                          <button
                            onClick={() => setDenunciaSelecionada(denuncia)}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <MessageSquare size={16} />
                            Continuar
                          </button>
                        )}
                        {(denuncia.status === 'procedente' || denuncia.status === 'improcedente') && (
                          <button
                            onClick={() => setDenunciaSelecionada(denuncia)}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            Ver Detalhes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal de Análise */}
      {denunciaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Análise de Denúncia</h2>
                <button
                  onClick={() => {
                    setDenunciaSelecionada(null);
                    setObservacao('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Informações da Denúncia */}
              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(denunciaSelecionada.tipo)}`}>
                      {getTipoLabel(denunciaSelecionada.tipo)}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(denunciaSelecionada.status)}`}>
                      {getStatusIcon(denunciaSelecionada.status)}
                      {getStatusLabel(denunciaSelecionada.status)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Campanha: {denunciaSelecionada.campanhaTitulo}
                  </h3>

                  <div className="mb-4">
                    <span className="text-sm text-slate-500">Descrição da denúncia:</span>
                    <p className="text-slate-700 mt-1">{denunciaSelecionada.descricao}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Denunciante:</span>
                      <p className="text-slate-800">{denunciaSelecionada.denuncianteNome}</p>
                      <p className="text-slate-400 text-xs">{denunciaSelecionada.denuncianteEmail}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Data:</span>
                      <p className="text-slate-800">
                        {new Date(denunciaSelecionada.dataDenuncia).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(denunciaSelecionada.dataDenuncia).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observação do Moderador (para casos já analisados) */}
                {denunciaSelecionada.observacaoModerador && (
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">
                        Análise de {denunciaSelecionada.moderadorNome}
                      </span>
                    </div>
                    <p className="text-slate-700">{denunciaSelecionada.observacaoModerador}</p>
                    {denunciaSelecionada.dataAnalise && (
                      <p className="text-xs text-slate-500 mt-2">
                        Analisado em: {new Date(denunciaSelecionada.dataAnalise).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                )}

                {/* Campo de Observação (para análise) */}
                {(denunciaSelecionada.status === 'pendente' || denunciaSelecionada.status === 'analisando') && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Observação do Moderador *
                    </label>
                    <textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={4}
                      className="w-full bg-white text-slate-800 rounded-lg p-3 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none"
                      placeholder="Descreva sua análise e conclusão sobre esta denúncia..."
                    />
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              {(denunciaSelecionada.status === 'pendente' || denunciaSelecionada.status === 'analisando') && (
                <div className="flex gap-3">
                  <button
                    onClick={() => finalizarAnalise(denunciaSelecionada.id, false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={20} />
                    Marcar como Improcedente
                  </button>
                  <button
                    onClick={() => finalizarAnalise(denunciaSelecionada.id, true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    <Ban size={20} />
                    Marcar como Procedente
                  </button>
                </div>
              )}

              {(denunciaSelecionada.status === 'procedente' || denunciaSelecionada.status === 'improcedente') && (
                <button
                  onClick={() => {
                    setDenunciaSelecionada(null);
                    setObservacao('');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
