'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { campanhaService } from '@/lib/api/services/campanha.service';
import type { CampanhaDto } from '@/types';
import { MapPin, Heart, HandHeart } from 'lucide-react';

export default function CampanhasPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [campanhas, setCampanhas] = useState<CampanhaDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const carregarCampanhas = async () => {
      try {
        const response = await campanhaService.getAll();
        setCampanhas(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCampanhas();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl">
                <Heart className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Campanhas Solidárias
                </h1>
                <p className="text-slate-400 mt-1">
                  Explore todas as campanhas ativas e faça a diferença na vida de alguém
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campanhas.map((campanha) => {
                const progresso = campanha.progresso || 0;
                
                return (
                  <div
                    key={campanha.id}
                    onClick={() => router.push(`/campanhas/${campanha.id}`)}
                    className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={campanha.imagemUrl}
                        alt={campanha.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {campanha.titulo}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-slate-400 mb-4">
                        <MapPin size={16} />
                        <span className="text-sm">{campanha.localizacao}</span>
                      </div>

                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {campanha.descricao}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-emerald-400 font-semibold">
                            R$ {campanha.valorArrecadado?.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-slate-400">
                            {progresso}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${Math.min(progresso, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Meta: R$ {campanha.metaArrecadacao?.toLocaleString('pt-BR')}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/campanhas/${campanha.id}`);
                          }}
                          className="w-full py-2 px-4 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 transition-all"
                        >
                          Ver Detalhes
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/campanhas/${campanha.id}/doar`);
                            }}
                            className="py-2 px-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Heart size={16} />
                            Doar
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/campanhas/${campanha.id}/voluntario`);
                            }}
                            className="py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <HandHeart size={16} />
                            Voluntário
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
