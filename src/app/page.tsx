'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Users, ShoppingBag, TrendingUp, HandHeart, Gift } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 text-slate-900">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-20 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SOS Comida"
              width={48}
              height={48}
              className="rounded-xl shadow-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              SOS Comida
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/campanhas" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
              Campanhas
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
              Entrar
            </Link>
            <Link 
              href="/registrar"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-white/80 backdrop-blur-lg border border-emerald-200 shadow-lg">
                <span className="text-xl">🍽️</span>
                <span className="font-semibold text-emerald-600">
                  Combatendo a Fome no Brasil
                </span>
              </div>

              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl blur-xl opacity-50"></div>
                  <Image
                    src="/logo.png"
                    alt="SOS Comida"
                    width={120}
                    height={120}
                    className="rounded-3xl shadow-2xl relative z-10"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                  SOS Comida
                </span>
                <span className="block text-3xl md:text-4xl text-slate-700 mt-2">
                  Ninguém passa fome sozinho
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl mb-8 text-slate-600 max-w-xl leading-relaxed">
                Conectamos <strong className="text-emerald-600">doadores</strong> a <strong className="text-blue-600">famílias em situação de vulnerabilidade</strong>. 
                Crie campanhas, doe alimentos e acompanhe o impacto real da sua solidariedade.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                <Link 
                  href="/campanhas"
                  className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-bold text-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)]"
                >
                  <span className="relative flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Quero Doar
                  </span>
                </Link>

                <Link 
                  href="/registrar"
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-white backdrop-blur-lg border-2 border-emerald-200 text-emerald-600 transform transition-all duration-300 hover:scale-105 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Criar Campanha
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span><strong className="text-emerald-600">5.000+</strong> famílias</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-blue-600" />
                  </div>
                  <span><strong className="text-blue-600">100+</strong> campanhas</span>
                </div>
              </div>
            </div>

            {/* Right Content - Food Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[500px]">
                {/* Central Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <div className="text-8xl mb-4">🍲</div>
                      <p className="text-lg font-semibold text-emerald-700">Alimento é Amor</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce" style={{animationDuration: '3s'}}>
                  <span className="text-4xl">🍎</span>
                </div>
                <div className="absolute top-20 right-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}>
                  <span className="text-3xl">🥖</span>
                </div>
                <div className="absolute bottom-20 left-20 w-18 h-18 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3 animate-bounce" style={{animationDuration: '2.8s', animationDelay: '1s'}}>
                  <span className="text-3xl">🥛</span>
                </div>
                <div className="absolute bottom-10 right-20 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce" style={{animationDuration: '3.2s', animationDelay: '0.3s'}}>
                  <span className="text-4xl">🍚</span>
                </div>
                <div className="absolute top-1/2 left-0 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce" style={{animationDuration: '2.7s', animationDelay: '0.7s'}}>
                  <span className="text-2xl">🥬</span>
                </div>
                <div className="absolute top-1/3 right-0 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce" style={{animationDuration: '3s', animationDelay: '1.2s'}}>
                  <span className="text-3xl">🍳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              <HandHeart className="w-5 h-5" />
              Como Funciona
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-800">
              Doar é <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">Simples</span>
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Em poucos passos você pode transformar a realidade de uma família
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <ShoppingBag className="w-8 h-8 text-white" />,
                title: 'Escolha uma Campanha',
                description: 'Navegue pelas campanhas ativas e escolha uma causa que toque seu coração.',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                step: '2',
                icon: <Heart className="w-8 h-8 text-white" />,
                title: 'Faça sua Doação',
                description: 'Contribua com qualquer valor. Cada real faz diferença na vida de uma família.',
                color: 'from-teal-500 to-teal-600'
              },
              {
                step: '3',
                icon: <TrendingUp className="w-8 h-8 text-white" />,
                title: 'Acompanhe o Impacto',
                description: 'Receba atualizações e veja como sua doação está ajudando pessoas reais.',
                color: 'from-blue-500 to-blue-600'
              }
            ].map((item, i) => (
              <div 
                key={i}
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-100 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {item.step}
                </div>
                
                <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600">
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-white">
            Nosso Impacto
          </h2>
          <p className="text-xl text-center mb-16 text-emerald-100">
            Juntos estamos fazendo a diferença
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🍽️', number: '50.000+', label: 'Refeições Servidas' },
              { icon: '👨‍👩‍👧‍👦', number: '5.000+', label: 'Famílias Ajudadas' },
              { icon: '📦', number: '10.000+', label: 'Cestas Doadas' },
              { icon: '🏢', number: '50+', label: 'Instituições Parceiras' }
            ].map((stat, i) => (
              <div 
                key={i}
                className="text-center p-8 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 transform transition-all duration-500 hover:scale-105 hover:bg-white/20"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-black mb-2 text-white">
                  {stat.number}
                </div>
                <p className="text-lg font-medium text-emerald-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-800">
              Histórias de <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">Esperança</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-3xl">
                  👩
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">Maria Silva</h4>
                  <p className="text-slate-500">Mãe de 3 filhos</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                "Graças ao SOS Comida, meus filhos não passam mais fome. A cesta básica que recebemos todo mês é uma bênção. Sou muito grata a todos os doadores."
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-3xl">
                  👨
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">João Santos</h4>
                  <p className="text-slate-500">Doador Frequente</p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic">
                "Poder acompanhar para onde vai minha doação e ver as famílias sendo ajudadas me motiva a continuar. A plataforma é transparente e fácil de usar."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 text-6xl">🍎</div>
              <div className="absolute bottom-10 right-10 text-6xl">🍞</div>
              <div className="absolute top-1/2 right-20 text-5xl">🥕</div>
            </div>
            
            <div className="relative text-center">
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo.png"
                  alt="SOS Comida"
                  width={80}
                  height={80}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
                Faça parte dessa corrente do bem
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Sua doação pode ser a refeição que faltava na mesa de uma família. Juntos, podemos acabar com a fome.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/registrar"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-bold text-xl transform transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-emerald-500/30"
                >
                  <Heart className="w-6 h-6" />
                  Quero Ajudar
                </Link>
                <Link 
                  href="/campanhas"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 backdrop-blur text-white rounded-2xl font-bold text-xl transform transition-all duration-300 hover:scale-105 border border-white/20 hover:bg-white/20"
                >
                  Ver Campanhas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="SOS Comida"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                SOS Comida
              </span>
            </div>
            
            <div className="flex flex-wrap gap-6 text-slate-500">
              <Link href="/sobre" className="hover:text-emerald-600 transition-colors">Sobre</Link>
              <Link href="/contato" className="hover:text-emerald-600 transition-colors">Contato</Link>
              <Link href="/termos" className="hover:text-emerald-600 transition-colors">Termos</Link>
              <Link href="/privacidade" className="hover:text-emerald-600 transition-colors">Privacidade</Link>
            </div>
            
            <p className="text-slate-400 text-sm">
              © 2025 SOS Comida. Feito com ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
