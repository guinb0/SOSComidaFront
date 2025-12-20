'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Campanha {
  id: number;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  localizacao: string;
  metaArrecadacao: number;
  valorArrecadado: number;
  progresso: number;
  nomeUsuario: string;
}

export default function HomePage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5118/api/campanhas/principais')
      .then(res => res.json())
      .then(data => {
        setCampanhas(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar campanhas:', err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-black">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
              SOS Comida
            </span>
          </h1>
          <nav className="flex gap-4">
            <Link href="/login" className="px-6 py-3 bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all font-semibold">
              Entrar
            </Link>
            <Link href="/registrar" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] transition-all font-semibold">
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h2 className="text-7xl md:text-9xl font-black mb-6 animate-fade-in">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
            Juntos Contra
          </span>
          <br />
          <span className="text-white">a Fome</span>
        </h2>
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto animate-slide-up">
          Conectando doadores a quem mais precisa. Cada contribuição transforma vidas.
        </p>
      </section>

      {/* Campanhas Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <h3 className="text-4xl font-bold text-white mb-12 text-center">
          Campanhas em Destaque
        </h3>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : campanhas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-xl">Nenhuma campanha disponível no momento.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {campanhas.map((campanha) => (
              <div
                key={campanha.id}
                className="group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
              >
                {/* Imagem */}
                <div className="relative h-48 overflow-hidden">
                  {campanha.imagemUrl ? (
                    <img
                      src={campanha.imagemUrl}
                      alt={campanha.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500 rounded-full text-sm font-bold">
                    {campanha.progresso}%
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {campanha.localizacao}
                  </div>
                  
                  <h4 className="text-2xl font-bold text-white mb-3">
                    {campanha.titulo}
                  </h4>
                  
                  <p className="text-white/70 mb-6 line-clamp-2">
                    {campanha.descricao}
                  </p>

                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-white/60 mb-2">
                      <span>{formatCurrency(campanha.valorArrecadado)}</span>
                      <span>{formatCurrency(campanha.metaArrecadacao)}</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(campanha.progresso, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg font-bold hover:shadow-[0_10px_40px_-15px_rgba(16,185,129,0.6)] transition-all">
                    Doar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/campanhas"
            className="inline-block px-8 py-4 bg-white/10 backdrop-blur-lg rounded-lg hover:bg-white/20 transition-all font-semibold text-lg"
          >
            Ver Todas as Campanhas →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
              SOS Comida
            </span>
          </h3>
          <p className="text-white/60">
            Transformando solidariedade em ação
          </p>
        </div>
      </footer>
    </div>
  );
}
