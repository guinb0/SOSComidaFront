'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  Shield, 
  Search, 
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  History,
  Map,
  Plus,
  X,
  Check
} from 'lucide-react';

interface Regiao {
  id: number;
  nome: string;
  sigla: string;
  estado?: string;
  cidade?: string;
}

interface Moderador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  tipo: 'super-moderador' | 'moderador';
  criadoEm: string;
  ativo: boolean;
  regioes?: Regiao[];
}

export default function ModeradoresPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [busca, setBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalRegioes, setMostrarModalRegioes] = useState(false);
  const [mostrarModalNovaRegiao, setMostrarModalNovaRegiao] = useState(false);
  const [moderadorSelecionado, setModeradorSelecionado] = useState<Moderador | null>(null);
  const [regioesSelecionadas, setRegioesSelecionadas] = useState<number[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cidade: ''
  });
  const [novaRegiao, setNovaRegiao] = useState({
    nome: '',
    sigla: '',
    estado: '',
    cidade: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Apenas admin pode acessar
    if (user.tipo !== 'admin') {
      alert('Acesso negado. Apenas o administrador pode acessar esta página.');
      router.push('/inicio');
      return;
    }

    carregarModeradores();
    carregarRegioes();
  }, [user, router]);

  const carregarRegioes = async () => {
    try {
      const response = await fetch('http://localhost:5118/api/regioes');
      if (response.ok) {
        const data = await response.json();
        setRegioes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
    }
  };

  const carregarRegioesDoModerador = async (moderadorId: number) => {
    try {
      const response = await fetch(`http://localhost:5118/api/regioes/moderador/${moderadorId}`);
      if (response.ok) {
        const data = await response.json();
        return data.map((r: Regiao) => r.id);
      }
    } catch (error) {
      console.error('Erro ao carregar regiões do moderador:', error);
    }
    return [];
  };

  const carregarModeradores = async () => {
    try {
      // Buscar moderadores da API
      const response = await fetch('http://localhost:5118/api/usuarios?tipo=moderador');
      if (response.ok) {
        const result = await response.json();
        const moderadoresApi = result.data.map((u: any) => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          telefone: u.telefone || '',
          cidade: u.cidade || '',
          tipo: u.tipo === 'admin' ? 'super-moderador' : 'moderador',
          criadoEm: u.dataCriacao,
          ativo: true
        }));
        
        // Também buscar admins
        const responseAdmin = await fetch('http://localhost:5118/api/usuarios?tipo=admin');
        if (responseAdmin.ok) {
          const resultAdmin = await responseAdmin.json();
          const admins = resultAdmin.data.map((u: any) => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone || '',
            cidade: u.cidade || '',
            tipo: 'super-moderador',
            criadoEm: u.dataCriacao,
            ativo: true
          }));
          setModeradores([...admins, ...moderadoresApi]);
        } else {
          setModeradores(moderadoresApi);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar moderadores:', error);
    }
  };

  const abrirModal = (moderador?: Moderador) => {
    if (moderador) {
      setEditandoId(moderador.id);
      setFormData({
        nome: moderador.nome,
        email: moderador.email,
        senha: '',
        telefone: moderador.telefone,
        cidade: moderador.cidade
      });
    } else {
      setEditandoId(null);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        cidade: ''
      });
    }
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setEditandoId(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      cidade: ''
    });
  };

  const abrirModalRegioes = async (moderador: Moderador) => {
    setModeradorSelecionado(moderador);
    const regioesIds = await carregarRegioesDoModerador(moderador.id);
    setRegioesSelecionadas(regioesIds);
    setMostrarModalRegioes(true);
  };

  const salvarRegioes = async () => {
    if (!moderadorSelecionado) return;

    try {
      const response = await fetch(`http://localhost:5118/api/regioes/moderador/${moderadorSelecionado.id}/atribuir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regioesIds: regioesSelecionadas })
      });

      if (response.ok) {
        alert('Regiões atribuídas com sucesso!');
        setMostrarModalRegioes(false);
        carregarModeradores();
      } else {
        alert('Erro ao atribuir regiões');
      }
    } catch (error) {
      console.error('Erro ao salvar regiões:', error);
      alert('Erro ao atribuir regiões');
    }
  };

  const criarNovaRegiao = async () => {
    if (!novaRegiao.nome || !novaRegiao.sigla) {
      alert('Nome e sigla são obrigatórios!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5118/api/regioes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaRegiao)
      });

      if (response.ok) {
        alert('Região criada com sucesso!');
        setMostrarModalNovaRegiao(false);
        setNovaRegiao({ nome: '', sigla: '', estado: '', cidade: '' });
        carregarRegioes();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar região');
      }
    } catch (error) {
      console.error('Erro ao criar região:', error);
      alert('Erro ao criar região');
    }
  };

  const toggleRegiao = (regiaoId: number) => {
    setRegioesSelecionadas(prev =>
      prev.includes(regiaoId)
        ? prev.filter(id => id !== regiaoId)
        : [...prev, regiaoId]
    );
  };

  const salvarModerador = () => {
    if (!formData.nome || !formData.email || (!editandoId && !formData.senha)) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    if (editandoId) {
      // Atualizar moderador existente
      setModeradores(prev =>
        prev.map(m => m.id === editandoId ? { ...m, ...formData } : m)
      );
      alert('Moderador atualizado com sucesso!');
    } else {
      // Criar novo moderador
      const novoModerador: Moderador = {
        id: Date.now(),
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cidade: formData.cidade,
        tipo: 'moderador',
        criadoEm: new Date().toISOString(),
        ativo: true
      };
      setModeradores(prev => [...prev, novoModerador]);
      alert('Moderador criado com sucesso!');
    }

    fecharModal();
  };

  const toggleStatus = (id: number) => {
    setModeradores(prev =>
      prev.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m)
    );
  };

  const excluirModerador = (id: number) => {
    const moderador = moderadores.find(m => m.id === id);
    
    if (moderador?.tipo === 'super-moderador') {
      alert('Não é possível excluir o super-moderador!');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o moderador ${moderador?.nome}?`)) {
      setModeradores(prev => prev.filter(m => m.id !== id));
      alert('Moderador excluído com sucesso!');
    }
  };

  const moderadoresFiltrados = moderadores.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    m.email.toLowerCase().includes(busca.toLowerCase()) ||
    m.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  if (!user || user.tipo !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-amber-600" size={32} />
              <h1 className="text-3xl font-bold text-slate-900">Gerenciar Moderadores</h1>
            </div>
            <p className="text-slate-600">
              Crie e gerencie moderadores da plataforma
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="text-slate-600 text-sm mb-1">Total de Moderadores</div>
              <div className="text-2xl font-bold text-slate-900">{moderadores.length}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-emerald-700 text-sm mb-1">Ativos</div>
              <div className="text-2xl font-bold text-emerald-600">
                {moderadores.filter(m => m.ativo).length}
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-amber-700 text-sm mb-1">Moderadores Comuns</div>
              <div className="text-2xl font-bold text-amber-600">
                {moderadores.filter(m => m.tipo === 'moderador').length}
              </div>
            </div>
          </div>

          {/* Barra de Ação */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Botão Histórico */}
              <button
                onClick={() => router.push('/moderadores/historico')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <History size={20} />
                Histórico
              </button>

              {/* Botão Adicionar */}
              <button
                onClick={() => abrirModal()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <UserPlus size={20} />
                Novo Moderador
              </button>
            </div>
          </div>

          {/* Lista de Moderadores */}
          <div className="space-y-4">
            {moderadoresFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-slate-600">Nenhum moderador encontrado</p>
              </div>
            ) : (
              moderadoresFiltrados.map((moderador) => (
                <div
                  key={moderador.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{moderador.nome}</h3>
                        {moderador.tipo === 'super-moderador' && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                            SUPER MODERADOR
                          </span>
                        )}
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          moderador.ativo
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {moderador.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={16} />
                          {moderador.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={16} />
                          {moderador.telefone}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={16} />
                          {moderador.cidade}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <Calendar size={14} />
                        Criado em {new Date(moderador.criadoEm).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {/* Ações */}
                    {moderador.tipo !== 'super-moderador' && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => abrirModalRegioes(moderador)}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Map size={16} />
                          Regiões
                        </button>

                        <button
                          onClick={() => abrirModal(moderador)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit size={16} />
                          Editar
                        </button>

                        <button
                          onClick={() => toggleStatus(moderador.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            moderador.ativo
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {moderador.ativo ? 'Desativar' : 'Ativar'}
                        </button>

                        <button
                          onClick={() => excluirModerador(moderador.id)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal de Criar/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {editandoId ? 'Editar Moderador' : 'Novo Moderador'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">
                  Senha {!editandoId && '*'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder={editandoId ? 'Deixe em branco para não alterar' : ''}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={salvarModerador}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {editandoId ? 'Salvar' : 'Criar'}
              </button>
              <button
                onClick={fecharModal}
                className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atribuir Regiões */}
      {mostrarModalRegioes && moderadorSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-200 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Regiões de {moderadorSelecionado.nome}
              </h2>
              <button
                onClick={() => setMostrarModalRegioes(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-slate-600 mb-4 text-sm">
              Selecione as regiões administrativas que este moderador poderá gerenciar.
            </p>

            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMostrarModalNovaRegiao(true)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <Plus size={16} />
                Criar Nova Região
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {regioes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  Nenhuma região cadastrada. Crie uma nova região primeiro.
                </p>
              ) : (
                regioes.map((regiao) => (
                  <div
                    key={regiao.id}
                    onClick={() => toggleRegiao(regiao.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      regioesSelecionadas.includes(regiao.id)
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                      regioesSelecionadas.includes(regiao.id)
                        ? 'bg-purple-600'
                        : 'bg-white border border-slate-300'
                    }`}>
                      {regioesSelecionadas.includes(regiao.id) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{regiao.nome}</div>
                      <div className="text-xs text-slate-500">
                        {regiao.sigla} • {regiao.cidade || regiao.estado || 'Sem localização'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={salvarRegioes}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Salvar Regiões
              </button>
              <button
                onClick={() => setMostrarModalRegioes(false)}
                className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Região */}
      {mostrarModalNovaRegiao && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nova Região Administrativa</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={novaRegiao.nome}
                  onChange={(e) => setNovaRegiao({ ...novaRegiao, nome: e.target.value })}
                  placeholder="Ex: Asa Norte"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Sigla *</label>
                <input
                  type="text"
                  value={novaRegiao.sigla}
                  onChange={(e) => setNovaRegiao({ ...novaRegiao, sigla: e.target.value.toUpperCase() })}
                  placeholder="Ex: DF-ASA-N"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Estado</label>
                <input
                  type="text"
                  value={novaRegiao.estado}
                  onChange={(e) => setNovaRegiao({ ...novaRegiao, estado: e.target.value })}
                  placeholder="Ex: Distrito Federal"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Cidade</label>
                <input
                  type="text"
                  value={novaRegiao.cidade}
                  onChange={(e) => setNovaRegiao({ ...novaRegiao, cidade: e.target.value })}
                  placeholder="Ex: Brasília"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={criarNovaRegiao}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Criar Região
              </button>
              <button
                onClick={() => setMostrarModalNovaRegiao(false)}
                className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
