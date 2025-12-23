'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { Bell, Building2, CheckCircle, XCircle, Eye, Clock, Check } from 'lucide-react';

interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dataCriacao: string;
  campanhaId: number | null;
  campanhaTitulo: string | null;
  statusDelegacao: string | null;
}

export default function NotificacoesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    carregarNotificacoes();
  }, [isAuthenticated, router, user]);

  const carregarNotificacoes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5118/api/notificacoes/usuario/${user.id}`);
      const data = await response.json();
      setNotificacoes(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: number) => {
    try {
      await fetch(`http://localhost:5118/api/notificacoes/${id}/lida`, { method: 'PUT' });
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    if (!user?.id) return;
    
    try {
      await fetch(`http://localhost:5118/api/notificacoes/usuario/${user.id}/marcar-todas-lidas`, { method: 'PUT' });
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const responderDelegacao = async (notificacaoId: number, aceitar: boolean) => {
    setProcessando(notificacaoId);
    
    try {
      const response = await fetch(`http://localhost:5118/api/notificacoes/${notificacaoId}/responder-delegacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aceitar })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await carregarNotificacoes();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao responder delegação');
      }
    } catch (error) {
      console.error('Erro ao responder delegação:', error);
      alert('Erro ao responder delegação');
    } finally {
      setProcessando(null);
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <Bell className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Notificações</h1>
                <p className="text-slate-600">
                  {naoLidas > 0 ? `${naoLidas} notificação(ões) não lida(s)` : 'Todas as notificações lidas'}
                </p>
              </div>
            </div>
            
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Check size={18} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-600">Carregando...</p>
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Bell className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                    notificacao.lida ? 'border-slate-200' : 'border-amber-300 bg-amber-50/50'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Ícone */}
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        notificacao.tipo === 'delegacao_campanha' 
                          ? 'bg-purple-100 text-purple-600'
                          : notificacao.tipo === 'resposta_delegacao'
                          ? 'bg-blue-100 text-blue-600'
                          : notificacao.tipo === 'advertencia'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notificacao.tipo === 'delegacao_campanha' ? (
                          <Building2 size={24} />
                        ) : (
                          <Bell size={24} />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-slate-900">{notificacao.titulo}</h3>
                          <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                            <Clock size={12} />
                            {new Date(notificacao.dataCriacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <p className="text-slate-600 text-sm mb-3">{notificacao.mensagem}</p>

                        {/* Campanha relacionada */}
                        {notificacao.campanhaTitulo && (
                          <div className="mb-3 p-3 bg-slate-100 rounded-lg">
                            <span className="text-xs text-slate-500">Campanha:</span>
                            <p className="text-sm font-medium text-slate-900">{notificacao.campanhaTitulo}</p>
                          </div>
                        )}

                        {/* Status da delegação */}
                        {notificacao.statusDelegacao && (
                          <div className="mb-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              notificacao.statusDelegacao === 'pendente'
                                ? 'bg-amber-100 text-amber-700'
                                : notificacao.statusDelegacao === 'aceita'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {notificacao.statusDelegacao === 'pendente' && <Clock size={14} />}
                              {notificacao.statusDelegacao === 'aceita' && <CheckCircle size={14} />}
                              {notificacao.statusDelegacao === 'recusada' && <XCircle size={14} />}
                              {notificacao.statusDelegacao === 'pendente' ? 'Aguardando resposta' : 
                               notificacao.statusDelegacao === 'aceita' ? 'Aceita' : 'Recusada'}
                            </span>
                          </div>
                        )}

                        {/* Ações para delegação pendente */}
                        {notificacao.tipo === 'delegacao_campanha' && notificacao.statusDelegacao === 'pendente' && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            <button
                              onClick={() => responderDelegacao(notificacao.id, true)}
                              disabled={processando === notificacao.id}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={18} />
                              Aceitar Campanha
                            </button>
                            <button
                              onClick={() => responderDelegacao(notificacao.id, false)}
                              disabled={processando === notificacao.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <XCircle size={18} />
                              Recusar
                            </button>
                            {notificacao.campanhaId && (
                              <button
                                onClick={() => router.push(`/campanhas/${notificacao.campanhaId}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                              >
                                <Eye size={18} />
                                Ver Campanha
                              </button>
                            )}
                          </div>
                        )}

                        {/* Botão marcar como lida */}
                        {!notificacao.lida && notificacao.tipo !== 'delegacao_campanha' && (
                          <button
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
