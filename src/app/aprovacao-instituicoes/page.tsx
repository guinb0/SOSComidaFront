'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  Building2, 
  Check, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  BadgeCheck,
  FileText
} from 'lucide-react';

interface Instituicao {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  cnpj: string | null;
  nomeInstituicao: string;
  descricaoInstituicao: string | null;
  statusAprovacao: string;
  dataCriacao: string;
  dataAprovacao: string | null;
  motivoRejeicao: string | null;
  emailCorporativo?: boolean;
  regiaoAdministrativa: {
    id: number;
    nome: string;
    sigla: string;
  } | null;
}

export default function AprovacaoInstituicoesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'pendentes' | 'aprovadas' | 'rejeitadas' | 'todas'>('pendentes');
  const [busca, setBusca] = useState('');
  const [modalRejeicao, setModalRejeicao] = useState<number | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);
  const [detalhes, setDetalhes] = useState<Instituicao | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.tipo !== 'admin' && user.tipo !== 'moderador') {
      alert('Acesso negado. Apenas moderadores podem acessar esta página.');
      router.push('/inicio');
      return;
    }

    carregarInstituicoes();
  }, [user, router, filtro]);

  const carregarInstituicoes = async () => {
    try {
      setLoading(true);
      const endpoint = filtro === 'pendentes' 
        ? 'http://localhost:5118/api/instituicoes/pendentes'
        : `http://localhost:5118/api/instituicoes${filtro !== 'todas' ? `?status=${filtro === 'aprovadas' ? 'aprovado' : 'rejeitado'}` : ''}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setInstituicoes(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprovarInstituicao = async (id: number) => {
    if (!user) return;
    
    try {
      setProcessando(id);
      const response = await fetch(`http://localhost:5118/api/instituicoes/${id}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderadorId: user.id })
      });

      if (response.ok) {
        alert('Instituição aprovada com sucesso!');
        carregarInstituicoes();
        setDetalhes(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao aprovar instituição');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar instituição');
    } finally {
      setProcessando(null);
    }
  };

  const rejeitarInstituicao = async (id: number) => {
    if (!user || !motivoRejeicao.trim()) {
      alert('Informe o motivo da rejeição');
      return;
    }
    
    try {
      setProcessando(id);
      const response = await fetch(`http://localhost:5118/api/instituicoes/${id}/rejeitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          moderadorId: user.id,
          motivo: motivoRejeicao 
        })
      });

      if (response.ok) {
        alert('Instituição rejeitada');
        setModalRejeicao(null);
        setMotivoRejeicao('');
        carregarInstituicoes();
        setDetalhes(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao rejeitar instituição');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar instituição');
    } finally {
      setProcessando(null);
    }
  };

  const instituicoesFiltradas = instituicoes.filter(inst => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      inst.nomeInstituicao?.toLowerCase().includes(termo) ||
      inst.email.toLowerCase().includes(termo) ||
      inst.cidade?.toLowerCase().includes(termo) ||
      inst.regiaoAdministrativa?.nome.toLowerCase().includes(termo)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Aprovada
          </span>
        );
      case 'rejeitado':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejeitada
          </span>
        );
      default:
        return null;
    }
  };

  const pendentesCount = instituicoes.filter(i => i.statusAprovacao === 'pendente').length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 md:ml-72">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Aprovação de Instituições</h1>
          </div>
          <p className="text-slate-600">
            Analise e aprove instituições cadastradas na plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div 
            onClick={() => setFiltro('pendentes')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filtro === 'pendentes' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendentesCount}</p>
                <p className="text-sm text-slate-600">Pendentes</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setFiltro('aprovadas')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filtro === 'aprovadas' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">-</p>
                <p className="text-sm text-slate-600">Aprovadas</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setFiltro('rejeitadas')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filtro === 'rejeitadas' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">-</p>
                <p className="text-sm text-slate-600">Rejeitadas</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setFiltro('todas')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filtro === 'todas' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">-</p>
                <p className="text-sm text-slate-600">Todas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, cidade ou região..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Instituições */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando instituições...</p>
            </div>
          ) : instituicoesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhuma instituição encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {instituicoesFiltradas.map((inst) => (
                <div key={inst.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {inst.nomeInstituicao || inst.nome}
                        </h3>
                        {getStatusBadge(inst.statusAprovacao)}
                        {inst.emailCorporativo && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            <BadgeCheck className="w-3 h-3" />
                            Email Corporativo
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {inst.email}
                        </div>
                        {inst.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {inst.telefone}
                          </div>
                        )}
                        {inst.regiaoAdministrativa && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {inst.regiaoAdministrativa.nome} ({inst.regiaoAdministrativa.sigla})
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          Cadastro: {new Date(inst.dataCriacao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      {inst.cnpj && (
                        <p className="text-sm text-slate-500">
                          <span className="font-medium">CNPJ:</span> {inst.cnpj}
                        </p>
                      )}

                      {inst.descricaoInstituicao && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {inst.descricaoInstituicao}
                        </p>
                      )}

                      {inst.motivoRejeicao && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Motivo da rejeição:</span> {inst.motivoRejeicao}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    {inst.statusAprovacao === 'pendente' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetalhes(inst)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Detalhes
                        </button>
                        <button
                          onClick={() => aprovarInstituicao(inst.id)}
                          disabled={processando === inst.id}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => setModalRejeicao(inst.id)}
                          disabled={processando === inst.id}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Rejeição */}
        {modalRejeicao && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Rejeitar Instituição</h3>
              <p className="text-slate-600 mb-4">
                Informe o motivo da rejeição. Esta informação será enviada para a instituição.
              </p>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Descreva o motivo da rejeição..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setModalRejeicao(null);
                    setMotivoRejeicao('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => rejeitarInstituicao(modalRejeicao)}
                  disabled={!motivoRejeicao.trim() || processando === modalRejeicao}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        {detalhes && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Detalhes da Instituição</h3>
                <button
                  onClick={() => setDetalhes(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações da Instituição */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Informações da Instituição
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Nome</p>
                      <p className="font-medium text-slate-900">{detalhes.nomeInstituicao}</p>
                    </div>
                    {detalhes.cnpj && (
                      <div>
                        <p className="text-slate-500">CNPJ</p>
                        <p className="font-medium text-slate-900">{detalhes.cnpj}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-500">Região Administrativa</p>
                      <p className="font-medium text-slate-900">
                        {detalhes.regiaoAdministrativa?.nome} ({detalhes.regiaoAdministrativa?.sigla})
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Data do Cadastro</p>
                      <p className="font-medium text-slate-900">
                        {new Date(detalhes.dataCriacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {detalhes.descricaoInstituicao && (
                    <div className="mt-4">
                      <p className="text-slate-500 mb-1">Descrição</p>
                      <p className="text-slate-900">{detalhes.descricaoInstituicao}</p>
                    </div>
                  )}
                </div>

                {/* Dados do Responsável */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-3">Responsável</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Nome</p>
                      <p className="font-medium text-slate-900">{detalhes.nome}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium text-slate-900 flex items-center gap-2">
                        {detalhes.email}
                        {detalhes.emailCorporativo && (
                          <span title="Email corporativo">
                            <BadgeCheck className="w-4 h-4 text-blue-600" />
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Telefone</p>
                      <p className="font-medium text-slate-900">{detalhes.telefone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cidade</p>
                      <p className="font-medium text-slate-900">{detalhes.cidade || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Aviso sobre email */}
                {detalhes.emailCorporativo ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Email corporativo detectado</p>
                        <p className="text-sm text-blue-700">
                          O email utilizado parece ser corporativo, o que aumenta a confiabilidade do cadastro.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Email pessoal utilizado</p>
                        <p className="text-sm text-amber-700">
                          O cadastro foi feito com um email pessoal (Gmail, Hotmail, etc). 
                          Considere solicitar verificação adicional antes de aprovar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setDetalhes(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setModalRejeicao(detalhes.id);
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => aprovarInstituicao(detalhes.id)}
                    disabled={processando === detalhes.id}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Aprovar Instituição
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
