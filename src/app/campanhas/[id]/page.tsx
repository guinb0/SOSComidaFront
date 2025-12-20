'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { MapPin, Calendar, Target, TrendingUp, Heart, ArrowLeft, HandHeart, Share2, MessageCircle } from 'lucide-react';
import { CampanhaDto } from '@/types';

export default function DetalheCampanhaPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [campanha, setCampanha] = useState<CampanhaDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const carregarCampanha = async () => {
      try {
        const id = parseInt(params.id as string);
        const response = await fetch(`http://localhost:5118/api/campanhas/${id}`);
        const data = await response.json();
        setCampanha(data);
      } catch (error) {
        console.error('Erro ao carregar campanha:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCampanha();
  }, [isAuthenticated, router, params.id]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-slate-400 text-xl">Carregando...</div>
        </main>
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <p className="text-slate-400 text-lg">Campanha não encontrada</p>
              <button
                onClick={() => router.push('/campanhas')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                Voltar para Campanhas
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const dataInicio = new Date(campanha.dataInicio);
  const dataFim = new Date(campanha.dataFim);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/campanhas')}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Campanhas</span>
          </button>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50">
            <div className="relative h-96 overflow-hidden">
              <img
                src={campanha.imagemUrl}
                alt={campanha.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {campanha.titulo}
                </h1>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={20} className="text-emerald-400" />
                  <span>{campanha.localizacao}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <Target className="text-emerald-400" size={20} />
                    </div>
                    <h3 className="text-slate-300 font-semibold text-sm">Meta</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    R$ {campanha.metaArrecadacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="text-blue-400" size={20} />
                    </div>
                    <h3 className="text-slate-300 font-semibold text-sm">Arrecadado</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    R$ {campanha.valorArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Heart className="text-purple-400" size={20} />
                    </div>
                    <h3 className="text-slate-300 font-semibold text-sm">Progresso</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {campanha.progresso}%
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="w-full bg-slate-700/30 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(campanha.progresso, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Sobre a Campanha</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {campanha.descricao}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="text-emerald-400" size={24} />
                    <h3 className="text-white font-semibold">Período da Campanha</h3>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <p>
                      <span className="text-slate-400">Início:</span>{' '}
                      {dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p>
                      <span className="text-slate-400">Término:</span>{' '}
                      {dataFim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="text-blue-400" size={24} />
                    <h3 className="text-white font-semibold">Status</h3>
                  </div>
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      campanha.ativa 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${campanha.ativa ? 'bg-emerald-400' : 'bg-slate-400'} animate-pulse`} />
                      <span className="font-semibold">{campanha.ativa ? 'Ativa' : 'Inativa'}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">{campanha.status}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/campanhas/${params.id}/doar`)}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-3"
                  >
                    <Heart size={24} />
                    Fazer Doação
                  </button>
                  <button
                    className="px-8 py-4 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2"
                  >
                    <Share2 size={20} />
                    Compartilhar
                  </button>
                </div>
                
                <button
                  onClick={() => router.push(`/campanhas/${params.id}/voluntario`)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-3"
                >
                  <HandHeart size={24} />
                  Quero ser Voluntário
                </button>

                <button
                  onClick={() => router.push(`/campanhas/${params.id}/chat`)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={24} />
                  Chat da Campanha
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>
    </div>
  );
}
