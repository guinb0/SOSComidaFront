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

    if (user.email !== 'guinb@soscomida.com') {
      alert('Acesso negado. Apenas administradores podem acessar esta página.');
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
      pendente: 'bg-yellow-900/30 text-yellow-500 border-yellow-700',
      analisando: 'bg-blue-900/30 text-blue-500 border-blue-700',
      procedente: 'bg-red-900/30 text-red-500 border-red-700',
      improcedente: 'bg-green-900/30 text-green-500 border-green-700',
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

  if (!user || user.email !== 'guinb@soscomida.com') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/moderacao')}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para Moderação
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Flag className="text-red-500" size={32} />
              <h1 className="text-3xl font-bold text-white">Denúncias</h1>
            </div>
            <p className="text-slate-400">
              Revise e analise as denúncias de campanhas reportadas pelos usuários
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Total</div>
              <div className="text-2xl font-bold text-white">{estatisticas.total}</div>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800">
              <div className="text-yellow-400 text-sm mb-1">Pendentes</div>
              <div className="text-2xl font-bold text-yellow-500">{estatisticas.pendentes}</div>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
              <div className="text-blue-400 text-sm mb-1">Em Análise</div>
              <div className="text-2xl font-bold text-blue-500">{estatisticas.analisando}</div>
            </div>
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-800">
              <div className="text-red-400 text-sm mb-1">Procedentes</div>
              <div className="text-2xl font-bold text-red-500">{estatisticas.procedentes}</div>
            </div>
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-800">
              <div className="text-green-400 text-sm mb-1">Improcedentes</div>
              <div className="text-2xl font-bold text-green-500">{estatisticas.improcedentes}</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400" />
                <span className="text-slate-400 text-sm">Filtros:</span>
              </div>
              
              {/* Filtro por Status */}
              <div className="flex flex-wrap gap-2">
                {(['todas', 'pendente', 'analisando', 'procedente', 'improcedente'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filtroStatus === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
              <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
                <Flag size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma denúncia encontrada com os filtros selecionados.</p>
              </div>
            ) : (
              denunciasFiltradas.map((denuncia) => (
                <div
                  key={denuncia.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
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
                        
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Campanha: {denuncia.campanhaTitulo}
                        </h3>
                        
                        <p className="text-slate-300 text-sm mb-3 line-clamp-2">
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
                            <span className="flex items-center gap-1 text-purple-400">
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
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            Analisar
                          </button>
                        )}
                        {denuncia.status === 'analisando' && (
                          <button
                            onClick={() => setDenunciaSelecionada(denuncia)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <MessageSquare size={16} />
                            Continuar
                          </button>
                        )}
                        {(denuncia.status === 'procedente' || denuncia.status === 'improcedente') && (
                          <button
                            onClick={() => setDenunciaSelecionada(denuncia)}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Análise de Denúncia</h2>
                <button
                  onClick={() => {
                    setDenunciaSelecionada(null);
                    setObservacao('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Informações da Denúncia */}
              <div className="space-y-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(denunciaSelecionada.tipo)}`}>
                      {getTipoLabel(denunciaSelecionada.tipo)}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(denunciaSelecionada.status)}`}>
                      {getStatusIcon(denunciaSelecionada.status)}
                      {getStatusLabel(denunciaSelecionada.status)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    Campanha: {denunciaSelecionada.campanhaTitulo}
                  </h3>

                  <div className="mb-4">
                    <span className="text-sm text-slate-400">Descrição da denúncia:</span>
                    <p className="text-slate-300 mt-1">{denunciaSelecionada.descricao}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Denunciante:</span>
                      <p className="text-white">{denunciaSelecionada.denuncianteNome}</p>
                      <p className="text-slate-500 text-xs">{denunciaSelecionada.denuncianteEmail}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Data:</span>
                      <p className="text-white">
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
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={16} className="text-purple-400" />
                      <span className="text-sm text-purple-400 font-medium">
                        Análise de {denunciaSelecionada.moderadorNome}
                      </span>
                    </div>
                    <p className="text-slate-300">{denunciaSelecionada.observacaoModerador}</p>
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
                    <label className="block text-sm text-slate-400 mb-2">
                      Observação do Moderador *
                    </label>
                    <textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700 focus:border-purple-500 focus:outline-none resize-none"
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
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={20} />
                    Marcar como Improcedente
                  </button>
                  <button
                    onClick={() => finalizarAnalise(denunciaSelecionada.id, true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
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
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
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
