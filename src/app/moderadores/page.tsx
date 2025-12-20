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
  History
} from 'lucide-react';

interface Moderador {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  tipo: 'super-moderador' | 'moderador';
  criadoEm: string;
  ativo: boolean;
}

export default function ModeradoresPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [busca, setBusca] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
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
  }, [user, router]);

  const carregarModeradores = () => {
    // Mock data - em produção virá da API
    const mockModeradores: Moderador[] = [
      {
        id: 1,
        nome: 'Guilherme Nobrega',
        email: 'guinb@soscomida.com',
        telefone: '(11) 98765-4321',
        cidade: 'São Paulo',
        tipo: 'super-moderador',
        criadoEm: '2024-01-01T00:00:00',
        ativo: true
      },
      {
        id: 2,
        nome: 'Ana Paula Silva',
        email: 'ana.moderadora@soscomida.com',
        telefone: '(21) 99876-5432',
        cidade: 'Rio de Janeiro',
        tipo: 'moderador',
        criadoEm: '2024-11-15T10:30:00',
        ativo: true
      },
      {
        id: 3,
        nome: 'Carlos Santos',
        email: 'carlos.mod@soscomida.com',
        telefone: '(31) 98765-1234',
        cidade: 'Belo Horizonte',
        tipo: 'moderador',
        criadoEm: '2024-12-01T14:20:00',
        ativo: true
      }
    ];
    setModeradores(mockModeradores);
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-amber-500" size={32} />
              <h1 className="text-3xl font-bold text-white">Gerenciar Moderadores</h1>
            </div>
            <p className="text-slate-400">
              Crie e gerencie moderadores da plataforma
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Total de Moderadores</div>
              <div className="text-2xl font-bold text-white">{moderadores.length}</div>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800">
              <div className="text-emerald-400 text-sm mb-1">Ativos</div>
              <div className="text-2xl font-bold text-emerald-500">
                {moderadores.filter(m => m.ativo).length}
              </div>
            </div>
            <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-800">
              <div className="text-amber-400 text-sm mb-1">Moderadores Comuns</div>
              <div className="text-2xl font-bold text-amber-500">
                {moderadores.filter(m => m.tipo === 'moderador').length}
              </div>
            </div>
          </div>

          {/* Barra de Ação */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-slate-900 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
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
              <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-slate-400">Nenhum moderador encontrado</p>
              </div>
            ) : (
              moderadoresFiltrados.map((moderador) => (
                <div
                  key={moderador.id}
                  className="bg-slate-800/50 rounded-lg border border-slate-700 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{moderador.nome}</h3>
                        {moderador.tipo === 'super-moderador' && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                            SUPER MODERADOR
                          </span>
                        )}
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          moderador.ativo
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {moderador.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail size={16} />
                          {moderador.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone size={16} />
                          {moderador.telefone}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
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
                      <div className="flex gap-2">
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
          <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editandoId ? 'Editar Moderador' : 'Novo Moderador'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Senha {!editandoId && '*'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder={editandoId ? 'Deixe em branco para não alterar' : ''}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
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
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
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
