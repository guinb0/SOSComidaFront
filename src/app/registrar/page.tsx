'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { govbrService } from '@/lib/api/services/govbr.service';

export default function RegistrarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    cpf: '',
    tipo: 'doador'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [govbrLoading, setGovbrLoading] = useState(false);
  const [fromGovBr, setFromGovBr] = useState(false);

  // Preencher dados vindos do gov.br
  useEffect(() => {
    const isFromGovBr = searchParams.get('govbr') === 'true';
    const dataParam = searchParams.get('data');
    
    if (isFromGovBr && dataParam) {
      try {
        const govbrData = JSON.parse(decodeURIComponent(dataParam));
        setFormData(prev => ({
          ...prev,
          nome: govbrData.name || '',
          email: govbrData.email || '',
          telefone: govbrData.phoneNumber || '',
          cpf: govbrData.cpf || '',
        }));
        setFromGovBr(true);
      } catch (err) {
        console.error('Erro ao processar dados do gov.br:', err);
      }
    }
  }, [searchParams]);

  const handleGovBrLogin = async () => {
    try {
      setGovbrLoading(true);
      setError('');
      // Redireciona para o OAuth2 do gov.br
      govbrService.redirectToLogin();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar com gov.br';
      setError(errorMessage);
      setGovbrLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5118/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          endereco: formData.endereco,
          cidade: formData.cidade,
          cpf: formData.cpf || null,
          tipo: formData.tipo === 'doador' ? 'usuario' : 'instituicao'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      setSuccess(true);
      // Redirecionar para login após 5 segundos
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center p-6">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Tela de Sucesso */}
      {success ? (
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Conta Criada com Sucesso!
            </h2>
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-emerald-400 font-semibold">Verifique seu E-mail!</span>
              </div>
              <p className="text-white/80 text-sm">
                Enviamos uma <strong>senha temporária</strong> para <strong className="text-emerald-400">{formData.email}</strong>
              </p>
              <p className="text-white/60 text-xs mt-2">
                Use essa senha para fazer seu primeiro login. Recomendamos alterá-la depois.
              </p>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Não encontrou o email? Verifique a pasta de spam.</span>
              </div>
            </div>
            
            <p className="text-white/50 text-sm mb-6">
              Redirecionando para login em 5 segundos...
            </p>
            
            <Link 
              href="/login" 
              className="inline-block w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl font-bold text-lg transform transition-all duration-300 hover:scale-105"
            >
              Ir para Login Agora
            </Link>
          </div>
        </div>
      ) : (
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              SOS Comida
            </h1>
          </Link>
          <h2 className="text-4xl font-bold mb-3">Criar Conta</h2>
          <p className="text-white/60 text-lg">Junte-se a nós e faça a diferença</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Gov.br Login Option */}
          <div className="mb-8">
            <button
              type="button"
              onClick={handleGovBrLogin}
              disabled={govbrLoading}
              className="w-full py-5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {govbrLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.94-7-5.03-7-9V8.3l7-3.5 7 3.5V11c0 3.97-3.13 8.06-7 9z"/>
                    <path d="M10 11h4v2h-4zm0-4h4v2h-4z"/>
                  </svg>
                  Cadastrar com gov.br
                </>
              )}
            </button>
            
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white/40 text-sm font-semibold">OU</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white placeholder-white/40"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white placeholder-white/40"
                placeholder="seu@email.com"
              />
            </div>

            {/* Telefone e CPF */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white placeholder-white/40"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white placeholder-white/40"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            {/* Endereço e Cidade */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white placeholder-white/40"
                  placeholder="Rua, número"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white placeholder-white/40"
                  placeholder="Sua cidade"
                />
              </div>
            </div>

            {/* Tipo de usuário */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">
                Tipo de Conta
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-white"
              >
                <option value="doador" className="bg-slate-900">Doador</option>
                <option value="instituicao" className="bg-slate-900">Instituição</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl font-bold text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando conta...
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-white/60">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Fazer Login
              </Link>
            </p>
            <Link href="/" className="block text-white/40 hover:text-white/60 transition-colors">
              ← Voltar para início
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold mb-1">Para Doadores</h3>
            <p className="text-sm text-white/60">Contribua com campanhas e veja o impacto real</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl">
            <div className="text-3xl mb-2">🏢</div>
            <h3 className="font-bold mb-1">Para Instituições</h3>
            <p className="text-sm text-white/60">Crie campanhas e alcance mais doadores</p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
