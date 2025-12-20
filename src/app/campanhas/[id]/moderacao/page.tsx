'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  Shield, 
  Users, 
  MessageCircle, 
  Bell, 
  ArrowLeft,
  UserX,
  Send,
  Pin,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Search,
  X
} from 'lucide-react';
import { ParticipanteCampanha, MensagemChat, AvisoCampanha, CampanhaDto } from '@/types';

type TabType = 'participantes' | 'chat' | 'avisos';

export default function ModeracaoCampanhaPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const campanhaId = parseInt(params.id as string);

  const [activeTab, setActiveTab] = useState<TabType>('participantes');
  const [campanha, setCampanha] = useState<CampanhaDto | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteCampanha[]>([]);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [avisos, setAvisos] = useState<AvisoCampanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Chat
  const [novaMensagem, setNovaMensagem] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Modal de remoção
  const [modalRemover, setModalRemover] = useState<ParticipanteCampanha | null>(null);
  const [motivoRemocao, setMotivoRemocao] = useState('');
  
  // Modal de aviso
  const [modalAviso, setModalAviso] = useState(false);
  const [avisoDestinatario, setAvisoDestinatario] = useState<ParticipanteCampanha | null>(null);
  const [avisoTitulo, setAvisoTitulo] = useState('');
  const [avisoMensagem, setAvisoMensagem] = useState('');
  const [avisoTipo, setAvisoTipo] = useState<'informativo' | 'advertencia' | 'urgente'>('informativo');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se é admin/moderador
    if (user.email !== 'guinb@soscomida.com' && user.tipo !== 'moderador') {
      alert('Acesso negado. Apenas moderadores podem acessar esta página.');
      router.push('/inicio');
      return;
    }

    carregarDados();
  }, [user, router, campanhaId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar campanha
      const resCampanha = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}`);
      if (resCampanha.ok) {
        const dataCampanha = await resCampanha.json();
        setCampanha(dataCampanha);
      }

      // Carregar participantes
      const resParticipantes = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}/participantes`);
      if (resParticipantes.ok) {
        const dataParticipantes = await resParticipantes.json();
        setParticipantes(dataParticipantes.data || []);
      }

      // Carregar mensagens do chat
      const resMensagens = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}/chat`);
      if (resMensagens.ok) {
        const dataMensagens = await resMensagens.json();
        setMensagens(dataMensagens.data || []);
      }

      // Carregar avisos
      const resAvisos = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}/avisos`);
      if (resAvisos.ok) {
        const dataAvisos = await resAvisos.json();
        setAvisos(dataAvisos.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const removerParticipante = async () => {
    if (!modalRemover || !motivoRemocao.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5118/api/campanhas/${campanhaId}/participantes/${modalRemover.usuarioId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campanhaId,
            usuarioId: modalRemover.usuarioId,
            moderadorId: user?.id,
            motivo: motivoRemocao
          })
        }
      );

      if (response.ok) {
        setParticipantes(prev => 
          prev.map(p => 
            p.usuarioId === modalRemover.usuarioId 
              ? { ...p, status: 'removido', motivoSaida: motivoRemocao }
              : p
          )
        );
        alert('Participante removido com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      alert('Erro ao remover participante');
    }

    setModalRemover(null);
    setMotivoRemocao('');
  };

  const enviarAviso = async () => {
    if (!avisoTitulo.trim() || !avisoMensagem.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5118/api/campanhas/${campanhaId}/avisos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campanhaId,
            moderadorId: user?.id,
            destinatarioId: avisoDestinatario?.usuarioId || null,
            titulo: avisoTitulo,
            mensagem: avisoMensagem,
            tipo: avisoTipo
          })
        }
      );

      if (response.ok) {
        const novoAviso = await response.json();
        setAvisos(prev => [novoAviso, ...prev]);
        alert(avisoDestinatario 
          ? `Aviso enviado para ${avisoDestinatario.nome}!` 
          : 'Aviso enviado para todos os participantes!');
      }
    } catch (error) {
      console.error('Erro ao enviar aviso:', error);
      alert('Erro ao enviar aviso');
    }

    setModalAviso(false);
    setAvisoDestinatario(null);
    setAvisoTitulo('');
    setAvisoMensagem('');
    setAvisoTipo('informativo');
  };

  const enviarMensagemChat = async () => {
    if (!novaMensagem.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5118/api/campanhas/${campanhaId}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campanhaId,
            usuarioId: user?.id,
            conteudo: novaMensagem
          })
        }
      );

      if (response.ok) {
        const mensagem = await response.json();
        setMensagens(prev => [...prev, mensagem]);
        setNovaMensagem('');
        
        // Scroll para o fim
        setTimeout(() => {
          chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const deletarMensagem = async (mensagemId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta mensagem?')) return;

    try {
      const response = await fetch(
        `http://localhost:5118/api/campanhas/${campanhaId}/chat/${mensagemId}?moderadorId=${user?.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setMensagens(prev => prev.filter(m => m.id !== mensagemId));
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
    }
  };

  const fixarMensagem = async (mensagemId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5118/api/campanhas/${campanhaId}/chat/${mensagemId}/fixar?moderadorId=${user?.id}`,
        { method: 'PUT' }
      );

      if (response.ok) {
        setMensagens(prev => 
          prev.map(m => 
            m.id === mensagemId 
              ? { ...m, fixada: !m.fixada, fixadaPorNome: !m.fixada ? user?.nome : undefined }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Erro ao fixar mensagem:', error);
    }
  };

  const participantesFiltrados = participantes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  const getTipoAvisoIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'advertencia':
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getTipoAvisoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return 'border-red-500/50 bg-red-500/10';
      case 'advertencia':
        return 'border-amber-500/50 bg-amber-500/10';
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  if (!user || (user.email !== 'guinb@soscomida.com' && user.tipo !== 'moderador')) {
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
          <div className="mb-6">
            <button
              onClick={() => router.push('/moderacao')}
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-4 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para Moderação</span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-red-500" size={32} />
              <h1 className="text-3xl font-bold text-white">
                Moderação: {campanha?.titulo || 'Campanha'}
              </h1>
            </div>
            <p className="text-slate-400">
              Gerencie participantes, chat e avisos desta campanha
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-800/50 p-2 rounded-lg border border-slate-700 w-fit">
            <button
              onClick={() => setActiveTab('participantes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'participantes'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users size={18} />
              Participantes ({participantes.filter(p => p.status === 'ativo').length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MessageCircle size={18} />
              Chat Geral
            </button>
            <button
              onClick={() => setActiveTab('avisos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'avisos'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bell size={18} />
              Avisos ({avisos.length})
            </button>
          </div>

          {/* Conteúdo da Tab */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Tab Participantes */}
            {activeTab === 'participantes' && (
              <div>
                {/* Barra de busca e ações */}
                <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar participante..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full bg-slate-900 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAvisoDestinatario(null);
                      setModalAviso(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Bell size={18} />
                    Enviar Aviso para Todos
                  </button>
                </div>

                {/* Lista de participantes */}
                <div className="divide-y divide-slate-700">
                  {participantesFiltrados.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      {busca ? 'Nenhum participante encontrado' : 'Nenhum participante nesta campanha'}
                    </div>
                  ) : (
                    participantesFiltrados.map((participante) => (
                      <div
                        key={participante.id}
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          participante.status !== 'ativo' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {participante.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{participante.nome}</h3>
                            <p className="text-slate-400 text-sm">{participante.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                participante.tipo === 'voluntario' 
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : participante.tipo === 'doador'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {participante.tipo}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                participante.status === 'ativo'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {participante.status}
                              </span>
                              <span className="text-xs text-slate-500">
                                Entrou em {new Date(participante.dataEntrada).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {participante.motivoSaida && (
                              <p className="text-xs text-red-400 mt-1">
                                Motivo: {participante.motivoSaida}
                              </p>
                            )}
                          </div>
                        </div>

                        {participante.status === 'ativo' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setAvisoDestinatario(participante);
                                setModalAviso(true);
                              }}
                              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Bell size={16} />
                              Enviar Aviso
                            </button>
                            <button
                              onClick={() => setModalRemover(participante)}
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <UserX size={16} />
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[600px]">
                {/* Mensagens fixadas */}
                {mensagens.filter(m => m.fixada).length > 0 && (
                  <div className="p-4 bg-amber-500/10 border-b border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                      <Pin size={16} />
                      Mensagens Fixadas
                    </div>
                    <div className="space-y-2">
                      {mensagens.filter(m => m.fixada).map(msg => (
                        <div key={msg.id} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium text-sm">{msg.nomeUsuario}</span>
                            <span className="text-xs text-slate-500">
                              Fixado por {msg.fixadaPorNome}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm mt-1">{msg.conteudo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de mensagens */}
                <div 
                  ref={chatRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {mensagens.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Nenhuma mensagem ainda. Seja o primeiro a enviar!
                    </div>
                  ) : (
                    mensagens.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 group ${
                          msg.usuarioId === user?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {msg.nomeUsuario.charAt(0).toUpperCase()}
                        </div>
                        <div className={`max-w-[70%] ${msg.usuarioId === user?.id ? 'items-end' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{msg.nomeUsuario}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(msg.dataEnvio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`rounded-2xl px-4 py-2 ${
                            msg.usuarioId === user?.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-200'
                          }`}>
                            {msg.conteudo}
                          </div>
                          {/* Ações do moderador */}
                          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => fixarMensagem(msg.id)}
                              className="text-slate-400 hover:text-amber-400 transition-colors"
                              title={msg.fixada ? 'Desafixar' : 'Fixar'}
                            >
                              <Pin size={14} className={msg.fixada ? 'text-amber-400' : ''} />
                            </button>
                            <button
                              onClick={() => deletarMensagem(msg.id)}
                              className="text-slate-400 hover:text-red-400 transition-colors"
                              title="Deletar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de mensagem */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && enviarMensagemChat()}
                      className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={enviarMensagemChat}
                      disabled={!novaMensagem.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Avisos */}
            {activeTab === 'avisos' && (
              <div>
                <div className="p-4 border-b border-slate-700">
                  <button
                    onClick={() => {
                      setAvisoDestinatario(null);
                      setModalAviso(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Bell size={18} />
                    Novo Aviso
                  </button>
                </div>

                <div className="divide-y divide-slate-700">
                  {avisos.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      Nenhum aviso enviado ainda
                    </div>
                  ) : (
                    avisos.map((aviso) => (
                      <div
                        key={aviso.id}
                        className={`p-4 border-l-4 ${getTipoAvisoColor(aviso.tipo)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getTipoAvisoIcon(aviso.tipo)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-semibold">{aviso.titulo}</h3>
                              <span className="text-xs text-slate-500">
                                {new Date(aviso.dataEnvio).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{aviso.mensagem}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Enviado por: {aviso.nomeModerador}</span>
                              <span>
                                Para: {aviso.nomeDestinatario || 'Todos os participantes'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full ${
                                aviso.tipo === 'urgente' 
                                  ? 'bg-red-500/20 text-red-400'
                                  : aviso.tipo === 'advertencia'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {aviso.tipo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Remover Participante */}
        {modalRemover && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserX className="text-red-500" size={24} />
                  Remover Participante
                </h3>
                <button
                  onClick={() => setModalRemover(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-slate-300 mb-4">
                Você está prestes a remover <strong className="text-white">{modalRemover.nome}</strong> desta campanha.
              </p>

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">
                  Motivo da remoção *
                </label>
                <textarea
                  value={motivoRemocao}
                  onChange={(e) => setMotivoRemocao(e.target.value)}
                  placeholder="Explique o motivo da remoção..."
                  rows={3}
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalRemover(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={removerParticipante}
                  disabled={!motivoRemocao.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Enviar Aviso */}
        {modalAviso && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bell className="text-blue-500" size={24} />
                  Enviar Aviso
                </h3>
                <button
                  onClick={() => {
                    setModalAviso(false);
                    setAvisoDestinatario(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-slate-300 mb-4">
                Enviando aviso para:{' '}
                <strong className="text-white">
                  {avisoDestinatario?.nome || 'Todos os participantes'}
                </strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tipo do Aviso</label>
                  <div className="flex gap-2">
                    {(['informativo', 'advertencia', 'urgente'] as const).map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setAvisoTipo(tipo)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                          avisoTipo === tipo
                            ? tipo === 'urgente'
                              ? 'bg-red-600 text-white'
                              : tipo === 'advertencia'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Título *</label>
                  <input
                    type="text"
                    value={avisoTitulo}
                    onChange={(e) => setAvisoTitulo(e.target.value)}
                    placeholder="Título do aviso"
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Mensagem *</label>
                  <textarea
                    value={avisoMensagem}
                    onChange={(e) => setAvisoMensagem(e.target.value)}
                    placeholder="Digite a mensagem do aviso..."
                    rows={4}
                    className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalAviso(false);
                    setAvisoDestinatario(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarAviso}
                  disabled={!avisoTitulo.trim() || !avisoMensagem.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Enviar Aviso
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
