'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  MessageCircle, 
  ArrowLeft,
  Send,
  Pin,
  Bell,
  AlertTriangle,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
import { MensagemChat, AvisoCampanha, CampanhaDto } from '@/types';

export default function ChatCampanhaPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const campanhaId = parseInt(params.id as string);

  const [campanha, setCampanha] = useState<CampanhaDto | null>(null);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [avisos, setAvisos] = useState<AvisoCampanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [mostrarAvisos, setMostrarAvisos] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    carregarDados();
    
    // Polling para novas mensagens (simples)
    const interval = setInterval(carregarMensagens, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, router, campanhaId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar campanha
      const resCampanha = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}`);
      if (resCampanha.ok) {
        const dataCampanha = await resCampanha.json();
        setCampanha(dataCampanha);
      }

      await carregarMensagens();
      await carregarAvisos();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarMensagens = async () => {
    try {
      const resMensagens = await fetch(`http://localhost:5118/api/campanhas/${campanhaId}/chat`);
      if (resMensagens.ok) {
        const dataMensagens = await resMensagens.json();
        setMensagens(dataMensagens.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const carregarAvisos = async () => {
    try {
      if (user?.id) {
        const resAvisos = await fetch(`http://localhost:5118/api/campanhas/avisos/usuario/${user.id}`);
        if (resAvisos.ok) {
          const dataAvisos = await resAvisos.json();
          // Filtrar avisos desta campanha
          const avisosCampanha = (dataAvisos.data || []).filter(
            (a: AvisoCampanha) => a.campanhaId === campanhaId
          );
          setAvisos(avisosCampanha);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    }
  };

  const enviarMensagem = async () => {
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
        
        setTimeout(() => {
          chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const marcarAvisoLido = async (avisoId: number) => {
    try {
      await fetch(`http://localhost:5118/api/campanhas/avisos/${avisoId}/lido`, {
        method: 'PUT'
      });
      setAvisos(prev => 
        prev.map(a => a.id === avisoId ? { ...a, lido: true } : a)
      );
    } catch (error) {
      console.error('Erro ao marcar aviso como lido:', error);
    }
  };

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
        return 'border-red-500 bg-red-50';
      case 'advertencia':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const avisosNaoLidos = avisos.filter(a => !a.lido).length;

  if (!isAuthenticated) {
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
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <button
              onClick={() => router.push(`/campanhas/${campanhaId}`)}
              className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors mb-4 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para a Campanha</span>
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-blue-600" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Chat: {campanha?.titulo || 'Campanha'}
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Converse com outros participantes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMostrarAvisos(true)}
                className="relative flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-200 shadow-sm"
              >
                <Bell size={18} />
                Avisos
                {avisosNaoLidos > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {avisosNaoLidos}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
            {/* Mensagens fixadas */}
            {mensagens.filter(m => m.fixada).length > 0 && (
              <div className="p-4 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-2">
                  <Pin size={16} />
                  Mensagens Fixadas
                </div>
                <div className="space-y-2">
                  {mensagens.filter(m => m.fixada).map(msg => (
                    <div key={msg.id} className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-medium text-sm">{msg.nomeUsuario}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.dataEnvio).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm mt-1">{msg.conteudo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de mensagens */}
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
            >
              {mensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Nenhuma mensagem ainda. Seja o primeiro a enviar!
                </div>
              ) : (
                mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.usuarioId === user?.id ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {msg.nomeUsuario.charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-[70%] ${msg.usuarioId === user?.id ? 'items-end' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${msg.usuarioId === user?.id ? 'flex-row-reverse' : ''}`}>
                        <span className="text-slate-900 font-medium text-sm">{msg.nomeUsuario}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.dataEnvio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.fixada && <Pin size={12} className="text-amber-500" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.usuarioId === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                      }`}>
                        {msg.conteudo}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
                  className="flex-1 bg-slate-50 text-slate-900 px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Avisos */}
        {mostrarAvisos && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col border border-slate-200 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="text-blue-600" size={24} />
                  Avisos da Campanha
                </h3>
                <button
                  onClick={() => setMostrarAvisos(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {avisos.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    Nenhum aviso para você
                  </div>
                ) : (
                  avisos.map((aviso) => (
                    <div
                      key={aviso.id}
                      className={`p-4 rounded-lg border-l-4 ${getTipoAvisoColor(aviso.tipo)} ${
                        !aviso.lido ? 'ring-2 ring-blue-500/50' : ''
                      }`}
                      onClick={() => !aviso.lido && marcarAvisoLido(aviso.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getTipoAvisoIcon(aviso.tipo)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-slate-900 font-semibold">{aviso.titulo}</h4>
                            {!aviso.lido && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                Novo
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 text-sm mb-2">{aviso.mensagem}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>De: {aviso.nomeModerador}</span>
                            <span>
                              {new Date(aviso.dataEnvio).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setMostrarAvisos(false)}
                className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
