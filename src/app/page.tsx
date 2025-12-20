'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl animate-fade-in">
            <span className="text-2xl">🌟</span>
            <span className="font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Plataforma de Doações Solidárias
            </span>
          </div>

          {/* Title */}
          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-tight animate-slide-up">
            <span className="block bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl">
              SOS Comida
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-3xl md:text-5xl font-bold mb-6 text-white/90 animate-slide-up" style={{animationDelay: '0.2s'}}>
            Conectando <span className="text-emerald-400">Solidariedade</span>
          </p>

          {/* Description */}
          <p className="text-xl md:text-2xl mb-12 text-white/70 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.4s'}}>
            Transforme vidas através de doações. Crie campanhas, ajude instituições e 
            acompanhe o impacto real em tempo real.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6 justify-center mb-16 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <Link 
              href="/login"
              className="group relative px-12 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl font-bold text-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <span className="relative flex items-center gap-3">
                Fazer Login
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link 
              href="/registrar"
              className="px-12 py-5 rounded-2xl font-bold text-lg bg-white/10 backdrop-blur-lg border-2 border-white/30 transform transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/50 hover:shadow-2xl"
            >
              Criar Conta Grátis
            </Link>

            <Link 
              href="/campanhas"
              className="group relative px-12 py-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-bold text-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_60px_-15px_rgba(147,51,234,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              <span className="relative">Explorar Campanhas</span>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce">
            <svg className="w-6 h-6 mx-auto text-white/50" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-black mb-6">
              Como <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Funciona</span>
            </h2>
            <p className="text-2xl text-white/60">Três passos simples para transformar vidas</p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '🎯',
                title: 'Crie Campanhas',
                description: 'Instituições criam campanhas com metas claras. Transparente e rastreável.',
                gradient: 'from-emerald-500/20 to-teal-500/20',
                iconGradient: 'from-emerald-500 to-teal-600'
              },
              {
                emoji: '💝',
                title: 'Doe com Segurança',
                description: 'Escolha uma causa e contribua. Acompanhe cada centavo em tempo real.',
                gradient: 'from-blue-500/20 to-purple-500/20',
                iconGradient: 'from-blue-500 to-purple-600'
              },
              {
                emoji: '📊',
                title: 'Veja o Impacto',
                description: 'Dashboard completo com progresso e impacto real das suas doações.',
                gradient: 'from-purple-500/20 to-pink-500/20',
                iconGradient: 'from-purple-500 to-pink-600'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className={`group relative p-10 rounded-3xl bg-gradient-to-br ${feature.gradient} backdrop-blur-lg border border-white/10 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}
              >
                <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center text-5xl shadow-2xl transform group-hover:rotate-12 transition-transform duration-500`}>
                  {feature.emoji}
                </div>
                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-6xl md:text-7xl font-black text-center mb-20">
            Nosso <span className="bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent">Impacto</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: '🎯', number: '100+', label: 'Campanhas Ativas' },
              { icon: '❤️', number: '5.000+', label: 'Famílias Ajudadas' },
              { icon: '💰', number: 'R$ 250k', label: 'Arrecadados' }
            ].map((stat, i) => (
              <div 
                key={i}
                className="text-center p-12 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 transform transition-all duration-500 hover:scale-110 hover:bg-white/10"
              >
                <div className="text-7xl mb-6">{stat.icon}</div>
                <div className="text-7xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <p className="text-2xl font-semibold text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-16 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10"></div>
            <div className="relative text-center">
              <h2 className="text-5xl md:text-7xl font-black mb-8">
                Pronto para <span className="bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent">fazer a diferença?</span>
              </h2>
              <p className="text-2xl text-white/70 mb-12 max-w-3xl mx-auto">
                Junte-se a milhares de pessoas transformando vidas através da solidariedade.
              </p>
              <Link 
                href="/registrar"
                className="inline-flex items-center gap-3 px-16 py-6 bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 rounded-2xl font-black text-2xl transform transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-emerald-500/50"
              >
                Começar Agora
                <span className="text-3xl">🚀</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              SOS Comida
            </h3>
            <p className="text-xl text-white/60">Juntos contra a fome 🤝</p>
          </div>
          <div className="flex flex-wrap gap-8 justify-center text-white/60 mb-8">
            <Link href="/sobre" className="text-lg hover:text-white transition-colors">Sobre</Link>
            <Link href="/contato" className="text-lg hover:text-white transition-colors">Contato</Link>
            <Link href="/termos" className="text-lg hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="text-lg hover:text-white transition-colors">Privacidade</Link>
          </div>
          <div className="text-center pt-8 border-t border-white/10 text-white/40">
            © 2025 SOS Comida. Feito com ❤️ para um mundo melhor.
          </div>
        </div>
      </footer>
    </div>
  );
}
