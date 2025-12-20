'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { campanhaService } from '@/lib/api/services/campanha.service';
import type { CampanhaDto } from '@/types';
import { MapPin } from 'lucide-react';

export default function InicioPage() {
  const { user, isAuthenticated } = useAuthStore();
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
        const response = await campanhaService.getPrincipais();
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 light-theme:bg-gradient-to-br light-theme:from-slate-50 light-theme:via-purple-50/50 light-theme:to-slate-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white light-theme:text-slate-950 mb-2">
              Bem-vindo, {user?.nome}!
            </h1>
            <p className="text-slate-400">
              Confira as campanhas em destaque e ajude quem mais precisa
            </p>
          </div>

          {/* Campanhas em Destaque */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Campanhas em Destaque
            </h2>
            
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {campanhas.map((campanha) => {
                  const progresso = campanha.progresso || 0;
                  
                  return (
                    <div
                      key={campanha.id}
                      className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
                    >
                      {/* Imagem */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={campanha.imagemUrl}
                          alt={campanha.titulo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      </div>

                      {/* Conteúdo */}
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

                        {/* Progress Bar */}
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

                        {/* Button */}
                        <button className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all">
                          Doar Agora
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Animated Background Orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>
    </div>
  );
}
