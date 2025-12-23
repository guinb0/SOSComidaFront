'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  HandHeart, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  ChevronRight,
  Loader2,
  Heart,
  Package,
  Shirt,
  Pill,
  MoreHorizontal
} from 'lucide-react';

interface Regiao {
  id: number;
  nome: string;
  sigla: string;
}

interface PedidoAjuda {
  id: number;
  titulo: string;
  descricao: string;
  localizacao: string;
  urgencia: string;
  status: string;
  quantidadePessoas: number;
  tipoAjuda: string | null;
  telefone: string | null;
  dataCriacao: string;
  dataAtendimento: string | null;
  usuario: { id: number; nome: string };
  regiao: { id: number; nome: string; sigla: string } | null;
  campanha: { id: number; titulo: string } | null;
}

interface Estatisticas {
  totalPedidos: number;
  pendentes: number;
  emAndamento: number;
  atendidos: number;
  criticos: number;
  pessoasAjudadas: number;
}

export default function PedidosAjudaPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  
  const [pedidos, setPedidos] = useState<PedidoAjuda[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('');
  const [filtroRegiao, setFiltroRegiao] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [modalNovoPedido, setModalNovoPedido] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState<PedidoAjuda | null>(null);
  const [processando, setProcessando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'meus'>('todos');

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    localizacao: '',
    urgencia: 'media',
    quantidadePessoas: 1,
    tipoAjuda: '',
    telefone: '',
    regiaoId: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    carregarDados();
  }, [isAuthenticated, router, filtroStatus, filtroUrgencia, filtroRegiao, abaAtiva]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar regiões
      const resRegioes = await fetch('http://localhost:5118/api/regioes');
      if (resRegioes.ok) {
        setRegioes(await resRegioes.json());
      }

      // Carregar estatísticas
      const resStats = await fetch('http://localhost:5118/api/pedidos-ajuda/estatisticas');
      if (resStats.ok) {
        setEstatisticas(await resStats.json());
      }

      // Carregar pedidos
      let url = abaAtiva === 'meus' && user
        ? `http://localhost:5118/api/pedidos-ajuda/meus/${user.id}`
        : 'http://localhost:5118/api/pedidos-ajuda?';

      if (abaAtiva === 'todos') {
        const params = new URLSearchParams();
        if (filtroStatus) params.append('status', filtroStatus);
        if (filtroUrgencia) params.append('urgencia', filtroUrgencia);
        if (filtroRegiao) params.append('regiaoId', filtroRegiao);
        url += params.toString();
      }

      const resPedidos = await fetch(url);
      if (resPedidos.ok) {
        const data = await resPedidos.json();
        setPedidos(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarPedido = async () => {
    if (!user) return;
    if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.localizacao.trim()) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    try {
      setProcessando(true);
      const response = await fetch('http://localhost:5118/api/pedidos-ajuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          usuarioId: user.id,
          regiaoId: formData.regiaoId ? parseInt(formData.regiaoId) : null
        })
      });

      if (response.ok) {
        alert('Pedido de ajuda criado com sucesso!');
        setModalNovoPedido(false);
        setFormData({
          titulo: '',
          descricao: '',
          localizacao: '',
          urgencia: 'media',
          quantidadePessoas: 1,
          tipoAjuda: '',
          telefone: '',
          regiaoId: ''
        });
        carregarDados();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar pedido');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar pedido');
    } finally {
      setProcessando(false);
    }
  };

  const atenderPedido = async (pedidoId: number) => {
    if (!user) return;
    
    try {
      setProcessando(true);
      const response = await fetch(`http://localhost:5118/api/pedidos-ajuda/${pedidoId}/atender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user.id })
      });

      if (response.ok) {
        alert('Você está atendendo este pedido!');
        setModalDetalhes(null);
        carregarDados();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao atender pedido');
      }
    } catch (error) {
      alert('Erro ao atender pedido');
    } finally {
      setProcessando(false);
    }
  };

  const concluirPedido = async (pedidoId: number) => {
    if (!user) return;
    
    try {
      setProcessando(true);
      const response = await fetch(`http://localhost:5118/api/pedidos-ajuda/${pedidoId}/concluir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user.id })
      });

      if (response.ok) {
        alert('Pedido marcado como atendido!');
        setModalDetalhes(null);
        carregarDados();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao concluir pedido');
      }
    } catch (error) {
      alert('Erro ao concluir pedido');
    } finally {
      setProcessando(false);
    }
  };

  const cancelarPedido = async (pedidoId: number) => {
    if (!user) return;
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    
    try {
      setProcessando(true);
      const response = await fetch(`http://localhost:5118/api/pedidos-ajuda/${pedidoId}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user.id, motivo: 'Cancelado pelo usuário' })
      });

      if (response.ok) {
        alert('Pedido cancelado');
        setModalDetalhes(null);
        carregarDados();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao cancelar pedido');
      }
    } catch (error) {
      alert('Erro ao cancelar pedido');
    } finally {
      setProcessando(false);
    }
  };

  const getUrgenciaBadge = (urgencia: string) => {
    const styles: Record<string, string> = {
      critica: 'bg-red-100 text-red-700 border-red-200',
      alta: 'bg-orange-100 text-orange-700 border-orange-200',
      media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      baixa: 'bg-green-100 text-green-700 border-green-200'
    };
    const labels: Record<string, string> = {
      critica: 'Crítica',
      alta: 'Alta',
      media: 'Média',
      baixa: 'Baixa'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[urgencia] || styles.media}`}>
        <AlertTriangle className="w-3 h-3" />
        {labels[urgencia] || 'Média'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { style: string; icon: React.ReactNode; label: string }> = {
      pendente: { 
        style: 'bg-amber-100 text-amber-700', 
        icon: <Clock className="w-3 h-3" />, 
        label: 'Pendente' 
      },
      em_andamento: { 
        style: 'bg-blue-100 text-blue-700', 
        icon: <Loader2 className="w-3 h-3 animate-spin" />, 
        label: 'Em andamento' 
      },
      atendido: { 
        style: 'bg-emerald-100 text-emerald-700', 
        icon: <CheckCircle className="w-3 h-3" />, 
        label: 'Atendido' 
      },
      cancelado: { 
        style: 'bg-slate-100 text-slate-600', 
        icon: <XCircle className="w-3 h-3" />, 
        label: 'Cancelado' 
      }
    };
    const { style, icon, label } = config[status] || config.pendente;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {icon}
        {label}
      </span>
    );
  };

  const getTipoAjudaIcon = (tipo: string | null) => {
    switch (tipo) {
      case 'alimentos': return <Package className="w-4 h-4" />;
      case 'roupas': return <Shirt className="w-4 h-4" />;
      case 'medicamentos': return <Pill className="w-4 h-4" />;
      case 'higiene': return <Heart className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(termo) ||
      p.descricao.toLowerCase().includes(termo) ||
      p.localizacao.toLowerCase().includes(termo)
    );
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 md:ml-72">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <HandHeart className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-slate-900">Pedidos de Ajuda</h1>
            </div>
            <p className="text-slate-600">
              Pessoas que precisam de ajuda imediata em sua região
            </p>
          </div>
          <button
            onClick={() => setModalNovoPedido(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-5 h-5" />
            Solicitar Ajuda
          </button>
        </div>

        {/* Stats Cards */}
        {estatisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{estatisticas.pendentes}</p>
                  <p className="text-sm text-slate-600">Pendentes</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{estatisticas.criticos}</p>
                  <p className="text-sm text-slate-600">Críticos</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{estatisticas.atendidos}</p>
                  <p className="text-sm text-slate-600">Atendidos</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{estatisticas.pessoasAjudadas}</p>
                  <p className="text-sm text-slate-600">Pessoas ajudadas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAbaAtiva('todos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              abaAtiva === 'todos' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todos os Pedidos
          </button>
          <button
            onClick={() => setAbaAtiva('meus')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              abaAtiva === 'meus' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Meus Pedidos
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="atendido">Atendido</option>
            </select>

            <select
              value={filtroUrgencia}
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas as urgências</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            <select
              value={filtroRegiao}
              onChange={(e) => setFiltroRegiao(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas as regiões</option>
              {regioes.map(r => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-slate-600">Carregando pedidos...</p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <HandHeart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Nenhum pedido encontrado</p>
              <p className="text-sm text-slate-500">
                {abaAtiva === 'meus' 
                  ? 'Você ainda não criou nenhum pedido de ajuda' 
                  : 'Tente ajustar os filtros'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pedidosFiltrados.map((pedido) => (
                <div 
                  key={pedido.id} 
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setModalDetalhes(pedido)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{pedido.titulo}</h3>
                        {getUrgenciaBadge(pedido.urgencia)}
                        {getStatusBadge(pedido.status)}
                      </div>

                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{pedido.descricao}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {pedido.localizacao}
                          {pedido.regiao && <span className="text-slate-400">({pedido.regiao.sigla})</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {pedido.quantidadePessoas} {pedido.quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}
                        </div>
                        {pedido.tipoAjuda && (
                          <div className="flex items-center gap-1">
                            {getTipoAjudaIcon(pedido.tipoAjuda)}
                            {pedido.tipoAjuda.charAt(0).toUpperCase() + pedido.tipoAjuda.slice(1)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Novo Pedido */}
        {modalNovoPedido && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Solicitar Ajuda</h2>
                <button
                  onClick={() => setModalNovoPedido(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título do pedido *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: Família precisando de alimentos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição detalhada *
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Descreva a situação e o que é necessário..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Localização *
                    </label>
                    <input
                      type="text"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Endereço ou ponto de referência"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Região Administrativa
                    </label>
                    <select
                      value={formData.regiaoId}
                      onChange={(e) => setFormData({ ...formData, regiaoId: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {regioes.map(r => (
                        <option key={r.id} value={r.id}>{r.nome} ({r.sigla})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Urgência
                    </label>
                    <select
                      value={formData.urgencia}
                      onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="baixa">Baixa - Pode aguardar alguns dias</option>
                      <option value="media">Média - Precisa de ajuda em breve</option>
                      <option value="alta">Alta - Precisa de ajuda urgente</option>
                      <option value="critica">Crítica - Situação de emergência</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de ajuda necessária
                    </label>
                    <select
                      value={formData.tipoAjuda}
                      onChange={(e) => setFormData({ ...formData, tipoAjuda: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option value="alimentos">Alimentos</option>
                      <option value="higiene">Produtos de higiene</option>
                      <option value="roupas">Roupas</option>
                      <option value="medicamentos">Medicamentos</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quantidade de pessoas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantidadePessoas}
                      onChange={(e) => setFormData({ ...formData, quantidadePessoas: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefone para contato
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setModalNovoPedido(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={criarPedido}
                    disabled={processando}
                    className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {processando && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enviar Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes */}
        {modalDetalhes && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getUrgenciaBadge(modalDetalhes.urgencia)}
                    {getStatusBadge(modalDetalhes.status)}
                  </div>
                  <button
                    onClick={() => setModalDetalhes(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-3">{modalDetalhes.titulo}</h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Descrição</h4>
                  <p className="text-slate-700">{modalDetalhes.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Localização</span>
                    </div>
                    <p className="font-medium text-slate-900">{modalDetalhes.localizacao}</p>
                    {modalDetalhes.regiao && (
                      <p className="text-sm text-slate-600">{modalDetalhes.regiao.nome}</p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Pessoas</span>
                    </div>
                    <p className="font-medium text-slate-900">
                      {modalDetalhes.quantidadePessoas} {modalDetalhes.quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}
                    </p>
                  </div>
                </div>

                {modalDetalhes.telefone && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">Telefone para contato</span>
                    </div>
                    <a 
                      href={`tel:${modalDetalhes.telefone}`}
                      className="font-medium text-orange-600 hover:text-orange-700"
                    >
                      {modalDetalhes.telefone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Solicitado por: <strong className="text-slate-700">{modalDetalhes.usuario.nome}</strong></span>
                  <span>•</span>
                  <span>{new Date(modalDetalhes.dataCriacao).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  {modalDetalhes.status === 'pendente' && modalDetalhes.usuario.id === user?.id && (
                    <button
                      onClick={() => cancelarPedido(modalDetalhes.id)}
                      disabled={processando}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                    >
                      Cancelar Pedido
                    </button>
                  )}
                  
                  {modalDetalhes.status === 'pendente' && modalDetalhes.usuario.id !== user?.id && (
                    <button
                      onClick={() => atenderPedido(modalDetalhes.id)}
                      disabled={processando}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                    >
                      {processando && <Loader2 className="w-4 h-4 animate-spin" />}
                      <HandHeart className="w-5 h-5" />
                      Quero Ajudar
                    </button>
                  )}

                  {modalDetalhes.status === 'em_andamento' && (
                    <button
                      onClick={() => concluirPedido(modalDetalhes.id)}
                      disabled={processando}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                    >
                      {processando && <Loader2 className="w-4 h-4 animate-spin" />}
                      <CheckCircle className="w-5 h-5" />
                      Marcar como Atendido
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
