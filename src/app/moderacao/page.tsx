'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  Shield, 
  Search, 
  Edit, 
  Pause, 
  Play, 
  CheckCircle, 
  XCircle,
  Calendar,
  DollarSign,
  MapPin,
  AlertTriangle,
  Flag,
  Building2,
  Send
} from 'lucide-react';

interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  localizacao: string;
  metaArrecadacao: number;
  valorArrecadado: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  ativa: boolean;
  usuarioId: number;
  regiaoId?: number;
  regiaoNome?: string;
}

interface Instituicao {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  endereco: string;
}

export default function ModeracaoPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [editandoCampanha, setEditandoCampanha] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Campanha>>({});
  const [modalDelegacao, setModalDelegacao] = useState<number | null>(null);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState<number | null>(null);

  // Mock de denúncias pendentes
  const [denunciasPendentes] = useState(7);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se é admin ou moderador
    if (user.tipo !== 'admin' && user.tipo !== 'moderador') {
      alert('Acesso negado. Apenas administradores podem acessar esta página.');
      router.push('/inicio');
      return;
    }

    carregarCampanhas();
  }, [user, router]);

  const carregarCampanhas = async () => {
    try {
      // Passa o moderadorId para filtrar por regiões
      const url = user?.id 
        ? `http://localhost:5118/api/campanhas/moderacao?moderadorId=${user.id}`
        : 'http://localhost:5118/api/campanhas/moderacao';
      const response = await fetch(url);
      const data = await response.json();
      setCampanhas(data);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (campanhaId: number, ativa: boolean) => {
    try {
      const endpoint = ativa 
        ? `http://localhost:5118/api/campanhas/${campanhaId}/pausar`
        : `http://localhost:5118/api/campanhas/${campanhaId}/aprovar`;
      
      const response = await fetch(endpoint, { method: 'POST' });
      
      if (response.ok) {
        // Recarregar campanhas após alteração
        await carregarCampanhas();
        alert(`Campanha ${!ativa ? 'aprovada/ativada' : 'pausada'} com sucesso!`);
      } else {
        alert('Erro ao alterar status da campanha');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status da campanha');
    }
  };

  const aprovarCampanha = async (campanhaId: number) => {
    try {
      const response = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}/aprovar`, { method: 'POST' });
      
      if (response.ok) {
        await carregarCampanhas();
        alert('Campanha aprovada com sucesso!');
      } else {
        alert('Erro ao aprovar campanha');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar campanha');
    }
  };

  const rejeitarCampanha = async (campanhaId: number) => {
    if (!confirm('Tem certeza que deseja rejeitar esta campanha?')) return;
    
    try {
      const response = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}/rejeitar`, { method: 'POST' });
      
      if (response.ok) {
        await carregarCampanhas();
        alert('Campanha rejeitada.');
      } else {
        alert('Erro ao rejeitar campanha');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar campanha');
    }
  };

  const abrirModalDelegacao = async (campanhaId: number) => {
    try {
      const response = await fetch('http://localhost:5118/api/campanhas/instituicoes');
      const data = await response.json();
      setInstituicoes(data.data || []);
      setModalDelegacao(campanhaId);
      setInstituicaoSelecionada(null);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      alert('Erro ao carregar instituições');
    }
  };

  const delegarCampanha = async () => {
    if (!modalDelegacao || !instituicaoSelecionada) return;
    
    try {
      const response = await fetch(`http://localhost:5118/api/campanhas/${modalDelegacao}/delegar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instituicaoId: instituicaoSelecionada })
      });
      
      if (response.ok) {
        const result = await response.json();
        await carregarCampanhas();
        setModalDelegacao(null);
        alert(result.message);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao delegar campanha');
      }
    } catch (error) {
      console.error('Erro ao delegar:', error);
      alert('Erro ao delegar campanha');
    }
  };

  const iniciarEdicao = (campanha: Campanha) => {
    setEditandoCampanha(campanha.id);
    setEditData({
      titulo: campanha.titulo,
      descricao: campanha.descricao,
      metaArrecadacao: campanha.metaArrecadacao,
      localizacao: campanha.localizacao,
      dataFim: campanha.dataFim,
      status: campanha.status
    });
  };

  const salvarEdicao = () => {
    if (!editandoCampanha) return;

    // Simular atualização (em produção seria uma API call)
    setCampanhas(prev =>
      prev.map(c => c.id === editandoCampanha ? { ...c, ...editData } : c)
    );
    
    setEditandoCampanha(null);
    setEditData({});
    alert('Campanha atualizada com sucesso!');
  };

  const cancelarEdicao = () => {
    setEditandoCampanha(null);
    setEditData({});
  };

  const finalizarCampanha = (campanhaId: number) => {
    if (confirm('Tem certeza que deseja finalizar esta campanha? Esta ação não pode ser desfeita.')) {
      setCampanhas(prev =>
        prev.map(c => c.id === campanhaId ? { ...c, status: 'Finalizada', ativa: false } : c)
      );
      alert('Campanha finalizada com sucesso!');
    }
  };

  const campanhasFiltradas = campanhas.filter(campanha => {
    const matchFiltro = 
      filtro === 'todas' ||
      (filtro === 'pendentes' && campanha.status === 'pendente') ||
      (filtro === 'ativas' && campanha.ativa && campanha.status !== 'pendente') ||
      (filtro === 'pausadas' && !campanha.ativa && campanha.status !== 'pendente' && campanha.status !== 'Finalizada') ||
      (filtro === 'finalizadas' && campanha.status === 'Finalizada');

    const matchBusca = 
      campanha.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      campanha.localizacao.toLowerCase().includes(busca.toLowerCase());

    return matchFiltro && matchBusca;
  });

  if (!user || (user.tipo !== 'admin' && user.tipo !== 'moderador')) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-slate-900">Painel de Moderação</h1>
          </div>
          <p className="text-slate-600">
            Gerencie todas as campanhas da plataforma
          </p>
        </div>

        {/* Card de Denúncias */}
        <button
          onClick={() => router.push('/denuncias')}
          className="w-full mb-6 bg-red-50 hover:bg-red-100 rounded-lg p-4 border border-red-200 transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Flag className="text-red-600" size={28} />
              </div>
              <div className="text-left">
                <div className="text-red-600 text-sm mb-1">Denúncias Pendentes</div>
                <div className="text-3xl font-bold text-red-700">{denunciasPendentes}</div>
              </div>
            </div>
            <div className="text-red-600 group-hover:text-red-700 transition-colors">
              Clique para revisar →
            </div>
          </div>
        </button>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-slate-600 text-sm mb-1">Total de Campanhas</div>
            <div className="text-2xl font-bold text-slate-900">{campanhas.length}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-orange-700 text-sm mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-orange-600">
              {campanhas.filter(c => c.status === 'pendente').length}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="text-emerald-700 text-sm mb-1">Campanhas Ativas</div>
            <div className="text-2xl font-bold text-emerald-600">
              {campanhas.filter(c => c.ativa && c.status !== 'pendente').length}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="text-amber-700 text-sm mb-1">Pausadas</div>
            <div className="text-2xl font-bold text-amber-600">
              {campanhas.filter(c => !c.ativa && c.status !== 'Finalizada' && c.status !== 'pendente').length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-slate-600 text-sm mb-1">Finalizadas</div>
            <div className="text-2xl font-bold text-slate-900">
              {campanhas.filter(c => c.status === 'Finalizada').length}
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título ou localização..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              {['todas', 'pendentes', 'ativas', 'pausadas', 'finalizadas'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filtro === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Campanhas */}
        <div className="space-y-4">
          {campanhasFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-600">Nenhuma campanha encontrada</p>
            </div>
          ) : (
            campanhasFiltradas.map((campanha) => (
              <div
                key={campanha.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
              >
                {editandoCampanha === campanha.id ? (
                  // Modo Edição
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Edit size={20} className="text-emerald-500" />
                      Editando Campanha
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Título</label>
                        <input
                          type="text"
                          value={editData.titulo || ''}
                          onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                          className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Descrição</label>
                        <textarea
                          value={editData.descricao || ''}
                          onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
                          rows={3}
                          className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Meta (R$)</label>
                          <input
                            type="number"
                            value={editData.metaArrecadacao || ''}
                            onChange={(e) => setEditData({ ...editData, metaArrecadacao: Number(e.target.value) })}
                            className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Localização</label>
                          <input
                            type="text"
                            value={editData.localizacao || ''}
                            onChange={(e) => setEditData({ ...editData, localizacao: e.target.value })}
                            className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Data Fim</label>
                          <input
                            type="date"
                            value={editData.dataFim?.split('T')[0] || ''}
                            onChange={(e) => setEditData({ ...editData, dataFim: e.target.value })}
                            className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Status</label>
                        <select
                          value={editData.status || ''}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Arrecadando doações">Arrecadando doações</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Pausada">Pausada</option>
                          <option value="Finalizada">Finalizada</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={salvarEdicao}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Salvar Alterações
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Modo Visualização
                  <div className="flex flex-col md:flex-row">
                    {/* Imagem */}
                    <div className="md:w-48 h-48 md:h-auto relative flex-shrink-0">
                      <img
                        src={campanha.imagemUrl}
                        alt={campanha.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                        campanha.status === 'pendente'
                          ? 'bg-orange-500 text-white'
                          : campanha.ativa
                          ? 'bg-emerald-500 text-white'
                          : campanha.status === 'Finalizada'
                          ? 'bg-slate-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {campanha.status === 'pendente' ? 'Pendente' : campanha.ativa ? 'Ativa' : campanha.status === 'Finalizada' ? 'Finalizada' : 'Pausada'}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{campanha.titulo}</h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{campanha.descricao}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Meta</div>
                          <div className="text-sm font-medium text-slate-900">
                            R$ {campanha.metaArrecadacao.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Arrecadado</div>
                          <div className="text-sm font-medium text-emerald-600">
                            R$ {campanha.valorArrecadado.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Progresso</div>
                          <div className="text-sm font-medium text-slate-900">
                            {Math.round((campanha.valorArrecadado / campanha.metaArrecadacao) * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Localização</div>
                          <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
                            <MapPin size={14} />
                            {campanha.localizacao}
                          </div>
                        </div>
                        {campanha.regiaoNome && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Região</div>
                            <div className="text-sm font-medium text-indigo-600">
                              {campanha.regiaoNome}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex flex-wrap gap-2">
                        {/* Botões especiais para campanhas pendentes */}
                        {campanha.status === 'pendente' ? (
                          <>
                            <button
                              onClick={() => aprovarCampanha(campanha.id)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <CheckCircle size={16} />
                              Aprovar
                            </button>
                            <button
                              onClick={() => abrirModalDelegacao(campanha.id)}
                              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Building2 size={16} />
                              Delegar
                            </button>
                            <button
                              onClick={() => rejeitarCampanha(campanha.id)}
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <XCircle size={16} />
                              Rejeitar
                            </button>
                            <button
                              onClick={() => iniciarEdicao(campanha)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Edit size={16} />
                              Editar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => iniciarEdicao(campanha)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Edit size={16} />
                              Editar
                            </button>

                            <button
                              onClick={() => toggleStatus(campanha.id, campanha.ativa)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                campanha.ativa
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                              disabled={campanha.status === 'Finalizada'}
                            >
                              {campanha.ativa ? <Pause size={16} /> : <Play size={16} />}
                              {campanha.ativa ? 'Pausar' : 'Ativar'}
                            </button>

                            {campanha.status !== 'Finalizada' && (
                              <button
                                onClick={() => finalizarCampanha(campanha.id)}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle size={16} />
                                Finalizar
                              </button>
                            )}

                            <button
                              onClick={() => router.push(`/campanhas/${campanha.id}/moderacao`)}
                              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Shield size={16} />
                              Gerenciar
                            </button>

                            <button
                              onClick={() => router.push(`/campanhas/${campanha.id}`)}
                              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Ver Detalhes
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>

    {/* Modal de Delegação */}
    {modalDelegacao && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-purple-600" size={24} />
              Delegar Campanha para Instituição
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Selecione uma instituição para gerenciar esta campanha
            </p>
          </div>
          
          <div className="p-6 max-h-80 overflow-y-auto">
            {instituicoes.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600">Nenhuma instituição cadastrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {instituicoes.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => setInstituicaoSelecionada(inst.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      instituicaoSelecionada === inst.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <h3 className="font-semibold text-slate-900">{inst.nome}</h3>
                    <p className="text-sm text-slate-600">{inst.email}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {inst.cidade} - {inst.endereco}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
            <button
              onClick={() => setModalDelegacao(null)}
              className="flex-1 py-3 px-4 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={delegarCampanha}
              disabled={!instituicaoSelecionada}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Enviar Delegação
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
