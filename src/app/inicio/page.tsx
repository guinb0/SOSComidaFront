'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { campanhaService } from '@/lib/api/services/campanha.service';
import type { CampanhaDto } from '@/types';
import { MapPin, TrendingUp, Users, Heart, ArrowRight, Sparkles } from 'lucide-react';

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

  const stats = [
    { label: 'Campanhas Ativas', value: campanhas.length, icon: Heart, color: 'emerald' },
    { label: 'Pessoas Ajudadas', value: '2.4k+', icon: Users, color: 'blue' },
    { label: 'Total Arrecadado', value: 'R$ 45k', icon: TrendingUp, color: 'purple' },
  ];

  return (
    <div className="flex min-h-screen theme-bg-primary">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 md:p-10 pt-20 lg:pt-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="relative mb-12 p-8 md:p-12 rounded-3xl overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl" />
            <div className="absolute inset-0 backdrop-blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-emerald-500" size={20} />
                <span className="text-emerald-600 font-medium text-sm">Plataforma de Doações</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold theme-text-primary mb-4 leading-tight">
                Olá, <span className="text-gradient">{user?.nome?.split(' ')[0]}</span>!
              </h1>
              <p className="theme-text-secondary text-lg max-w-2xl mb-8">
                Sua contribuição faz a diferença. Confira as campanhas em destaque e ajude quem mais precisa.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="glass-card p-5 flex items-center gap-4 group hover:border-emerald-500/20 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                      <stat.icon className={`text-${stat.color}-400`} size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold theme-text-primary">{stat.value}</div>
                      <div className="theme-text-muted text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Campanhas em Destaque */}
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold theme-text-primary mb-1">Campanhas em Destaque</h2>
                <p className="theme-text-muted">Apoie causas que transformam vidas</p>
              </div>
              <button 
                onClick={() => router.push('/campanhas')}
                className="btn-ghost flex items-center gap-2"
              >
                Ver todas <ArrowRight size={18} />
              </button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-6 animate-pulse">
                    <div className="h-48 bg-slate-100 rounded-xl mb-4" />
                    <div className="h-6 bg-slate-100 rounded-lg mb-2 w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {campanhas.map((campanha, index) => {
                  const progresso = campanha.progresso || 0;
                  
                  return (
                    <div
                      key={campanha.id}
                      className="group glass-card overflow-hidden hover:border-emerald-500/20 transition-all duration-500 cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => router.push(`/campanhas/${campanha.id}`)}
                    >
                      {/* Imagem */}
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={campanha.imagemUrl || '/placeholder-campaign.jpg'}
                          alt={campanha.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="badge badge-success">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                            Ativa
                          </span>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold theme-text-primary mb-3 line-clamp-2 group-hover:text-emerald-500 transition-colors">
                          {campanha.titulo}
                        </h3>
                        
                        <div className="flex items-center gap-2 theme-text-muted mb-4">
                          <MapPin size={14} />
                          <span className="text-sm">{campanha.localizacao}</span>
                        </div>

                        <p className="theme-text-secondary text-sm mb-5 line-clamp-2 leading-relaxed">
                          {campanha.descricao}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="theme-text-primary font-semibold">
                              R$ {campanha.valorArrecadado?.toLocaleString('pt-BR') || '0'}
                            </span>
                            <span className="theme-text-muted">
                              de R$ {campanha.metaArrecadacao?.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${Math.min(progresso, 100)}%` }}
                            />
                          </div>
                          <div className="text-right text-xs text-emerald-600 mt-1 font-medium">
                            {progresso}% arrecadado
                          </div>
                        </div>

                        {/* Button */}
                        <button className="w-full btn-primary flex items-center justify-center gap-2 group/btn">
                          <Heart size={18} />
                          <span>Contribuir</span>
                          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Subtle Background Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>
      </main>
    </div>
  );
}
