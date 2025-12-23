'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, Users, User, Mail, Phone, Calendar, Shield, Eye, AlertTriangle, UserX, X } from 'lucide-react';
import { CampanhaDto } from '@/types';

interface Participante {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  emailUsuario: string;
  telefoneUsuario?: string;
  tipo: string;
  status: string;
  dataInscricao: string;
}

export default function VoluntariosCampanhaPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [campanha, setCampanha] = useState<CampanhaDto | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoAcao, setTipoAcao] = useState<'advertencia' | 'remover'>('advertencia');
  const [participanteSelecionado, setParticipanteSelecionado] = useState<Participante | null>(null);
  const [mensagemAviso, setMensagemAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const isModerador = user?.tipo === 'admin' || user?.tipo === 'moderador';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isModerador) {
      router.push(`/campanhas/${params.id}`);
      return;
    }

    const carregarDados = async () => {
      try {
        const id = parseInt(params.id as string);
        
        // Carregar campanha
        const resCampanha = await fetch(`http://localhost:5118/api/campanhas/${id}`);
        if (resCampanha.ok) {
          const dataCampanha = await resCampanha.json();
          setCampanha(dataCampanha);
        }

        // Carregar participantes
        const resParticipantes = await fetch(`http://localhost:5118/api/campanhas/${id}/participantes`);
        if (resParticipantes.ok) {
          const dataParticipantes = await resParticipantes.json();
          setParticipantes(dataParticipantes.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [isAuthenticated, router, params.id, isModerador]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pendente':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'inativo':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'voluntario':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'doador':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const abrirModal = (participante: Participante, tipo: 'advertencia' | 'remover') => {
    setParticipanteSelecionado(participante);
    setTipoAcao(tipo);
    setMensagemAviso(tipo === 'advertencia' 
      ? 'Você está recebendo uma advertência por descumprimento das regras da campanha.'
      : 'Você foi removido desta campanha pelo moderador.');
    setModalAberto(true);
  };

  const enviarAcao = async () => {
    if (!participanteSelecionado || !mensagemAviso.trim()) return;
    
    setEnviando(true);
    try {
      const campanhaId = parseInt(params.id as string);
      
      if (tipoAcao === 'remover') {
        // Remover participante
        const resRemover = await fetch(
          `http://localhost:5118/api/campanhas/${campanhaId}/participantes/${participanteSelecionado.id}/remover`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moderadorId: user?.id,
              motivo: mensagemAviso
            })
          }
        );
        
        if (!resRemover.ok) {
          const error = await resRemover.json();
          throw new Error(error.message || 'Erro ao remover participante');
        }
        
        // Atualizar lista removendo o participante
        setParticipantes(prev => prev.filter(p => p.id !== participanteSelecionado.id));
      } else {
        // Enviar advertência
        const resAdvertencia = await fetch(
          `http://localhost:5118/api/campanhas/${campanhaId}/participantes/${participanteSelecionado.id}/advertencia`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moderadorId: user?.id,
              mensagem: mensagemAviso
            })
          }
        );
        
        if (!resAdvertencia.ok) {
          const error = await resAdvertencia.json();
          throw new Error(error.message || 'Erro ao enviar advertência');
        }
      }
      
      alert(tipoAcao === 'remover' 
        ? 'Participante removido e notificado com sucesso!'
        : 'Advertência enviada com sucesso!');
      
      setModalAberto(false);
      setParticipanteSelecionado(null);
      setMensagemAviso('');
    } catch (error: any) {
      alert(error.message || 'Erro ao realizar ação');
    } finally {
      setEnviando(false);
    }
  };

  if (!isAuthenticated || !isModerador || loading) {
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
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push(`/campanhas/${params.id}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Detalhes</span>
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="text-purple-600" size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Voluntários da Campanha
                  </h1>
                  <p className="text-slate-600">{campanha?.titulo}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Shield size={20} />
                <span className="font-medium">Modo Moderador</span>
                <span className="text-amber-700/70 text-sm ml-2">
                  - Você pode visualizar os dados de contato dos voluntários
                </span>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-slate-500 text-sm mb-1">Total de Voluntários</div>
              <div className="text-3xl font-bold text-slate-900">
                {participantes.filter(p => p.tipo === 'voluntario').length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-slate-500 text-sm mb-1">Ativos</div>
              <div className="text-3xl font-bold text-emerald-600">
                {participantes.filter(p => p.status === 'ativo').length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="text-slate-500 text-sm mb-1">Pendentes</div>
              <div className="text-3xl font-bold text-amber-600">
                {participantes.filter(p => p.status === 'pendente').length}
              </div>
            </div>
          </div>

          {/* Lista de Voluntários */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Lista de Participantes</h2>
            </div>

            {participantes.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">Nenhum voluntário inscrito ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {participantes.map((participante) => (
                  <div key={participante.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {participante.nomeUsuario.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {participante.nomeUsuario}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTipoColor(participante.tipo)}`}>
                            {participante.tipo === 'voluntario' ? 'Voluntário' : participante.tipo}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(participante.status)}`}>
                            {participante.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          {participante.emailUsuario && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{participante.emailUsuario}</span>
                            </div>
                          )}
                          {participante.telefoneUsuario && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{participante.telefoneUsuario}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              Inscrito em {new Date(participante.dataInscricao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/perfil/${participante.usuarioId}`)}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
                          title="Ver Perfil"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => abrirModal(participante, 'advertencia')}
                          className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium text-sm"
                          title="Enviar Advertência"
                        >
                          <AlertTriangle size={16} />
                        </button>
                        <button
                          onClick={() => abrirModal(participante, 'remover')}
                          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                          title="Remover da Campanha"
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Advertência/Remoção */}
        {modalAberto && participanteSelecionado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${
                  tipoAcao === 'remover' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {tipoAcao === 'remover' ? (
                    <>
                      <UserX size={24} />
                      Remover Participante
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={24} />
                      Enviar Advertência
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setModalAberto(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {participanteSelecionado.nomeUsuario.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{participanteSelecionado.nomeUsuario}</p>
                    <p className="text-sm text-slate-500">{participanteSelecionado.emailUsuario}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {tipoAcao === 'remover' ? 'Motivo da remoção (será enviado ao usuário):' : 'Mensagem de advertência:'}
                </label>
                <textarea
                  value={mensagemAviso}
                  onChange={(e) => setMensagemAviso(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                  placeholder={tipoAcao === 'remover' 
                    ? 'Informe o motivo da remoção...'
                    : 'Descreva o motivo da advertência...'}
                />
              </div>

              <div className={`p-3 rounded-lg mb-4 ${
                tipoAcao === 'remover' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className={`text-sm ${tipoAcao === 'remover' ? 'text-red-700' : 'text-amber-700'}`}>
                  {tipoAcao === 'remover' 
                    ? '⚠️ Atenção: O usuário será removido da campanha e receberá uma notificação com o motivo informado.'
                    : '⚠️ O usuário receberá uma notificação com esta advertência.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarAcao}
                  disabled={enviando || !mensagemAviso.trim()}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    tipoAcao === 'remover'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {enviando ? 'Enviando...' : tipoAcao === 'remover' ? 'Remover e Notificar' : 'Enviar Advertência'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
