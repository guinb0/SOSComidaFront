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
  Flag
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
      const response = await fetch('http://localhost:5118/campanhas');
      const data = await response.json();
      setCampanhas(data);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (campanhaId: number, ativa: boolean) => {
    // Simular atualização (em produção seria uma API call)
    setCampanhas(prev => 
      prev.map(c => c.id === campanhaId ? { ...c, ativa: !ativa } : c)
    );
    alert(`Campanha ${!ativa ? 'ativada' : 'pausada'} com sucesso!`);
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
      (filtro === 'ativas' && campanha.ativa) ||
      (filtro === 'pausadas' && !campanha.ativa) ||
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
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-red-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Painel de Moderação</h1>
          </div>
          <p className="text-slate-400">
            Gerencie todas as campanhas da plataforma
          </p>
        </div>

        {/* Card de Denúncias */}
        <button
          onClick={() => router.push('/denuncias')}
          className="w-full mb-6 bg-red-900/30 hover:bg-red-900/40 rounded-lg p-4 border border-red-800 transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-red-600/20 p-3 rounded-lg">
                <Flag className="text-red-500" size={28} />
              </div>
              <div className="text-left">
                <div className="text-red-400 text-sm mb-1">Denúncias Pendentes</div>
                <div className="text-3xl font-bold text-red-500">{denunciasPendentes}</div>
              </div>
            </div>
            <div className="text-red-400 group-hover:text-red-300 transition-colors">
              Clique para revisar →
            </div>
          </div>
        </button>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total de Campanhas</div>
            <div className="text-2xl font-bold text-white">{campanhas.length}</div>
          </div>
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800">
            <div className="text-emerald-400 text-sm mb-1">Campanhas Ativas</div>
            <div className="text-2xl font-bold text-emerald-500">
              {campanhas.filter(c => c.ativa).length}
            </div>
          </div>
          <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-800">
            <div className="text-amber-400 text-sm mb-1">Pausadas</div>
            <div className="text-2xl font-bold text-amber-500">
              {campanhas.filter(c => !c.ativa && c.status !== 'Finalizada').length}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Finalizadas</div>
            <div className="text-2xl font-bold text-white">
              {campanhas.filter(c => c.status === 'Finalizada').length}
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título ou localização..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-900 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              {['todas', 'ativas', 'pausadas', 'finalizadas'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filtro === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
            <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400">Nenhuma campanha encontrada</p>
            </div>
          ) : (
            campanhasFiltradas.map((campanha) => (
              <div
                key={campanha.id}
                className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
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
                          className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
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
                        campanha.ativa
                          ? 'bg-emerald-500 text-white'
                          : campanha.status === 'Finalizada'
                          ? 'bg-slate-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {campanha.ativa ? 'Ativa' : campanha.status === 'Finalizada' ? 'Finalizada' : 'Pausada'}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{campanha.titulo}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{campanha.descricao}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Meta</div>
                          <div className="text-sm font-medium text-white">
                            R$ {campanha.metaArrecadacao.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Arrecadado</div>
                          <div className="text-sm font-medium text-emerald-400">
                            R$ {campanha.valorArrecadado.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Progresso</div>
                          <div className="text-sm font-medium text-white">
                            {Math.round((campanha.valorArrecadado / campanha.metaArrecadacao) * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Localização</div>
                          <div className="text-sm font-medium text-white flex items-center gap-1">
                            <MapPin size={14} />
                            {campanha.localizacao}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-wrap gap-2">
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
                          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Ver Detalhes
                        </button>
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
    </div>
  );
}
