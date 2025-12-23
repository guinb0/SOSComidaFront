"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

// Chave de teste do reCAPTCHA (substitua pela sua chave de produção)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setRequires2FA = useAuthStore((s) => s.setRequires2FA);
  const router = useRouter();

  // Verificar se veio do registro
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Conta criada com sucesso! Faça login para continuar.');
    }
  }, [searchParams]);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Por favor, complete o CAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email: usuario, senha });
      
      // Verificar se é senha temporária
      if (res.senhaTemporaria) {
        setTempUserId(res.usuario.id);
        setShowChangePassword(true);
        setLoading(false);
        return;
      }
      
      setUser(res.usuario);
      setToken(res.token);
      setRequires2FA(!!res.requires2FA);
      router.push('/inicio');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Usuário ou senha inválidos');
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5118/auth/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: tempUserId,
          senhaAtual: senha,
          novaSenha: novaSenha
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao alterar senha');
      }

      // Fazer login novamente com a nova senha
      const res = await authService.login({ email: usuario, senha: novaSenha });
      setUser(res.usuario);
      setToken(res.token);
      setRequires2FA(!!res.requires2FA);
      router.push('/inicio');
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!usuario) {
      setError('Digite seu email primeiro');
      return;
    }

    setLoading(true);
    try {
      await fetch('http://localhost:5118/auth/reenviar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario })
      });

      alert('Se o email estiver cadastrado, você receberá uma nova senha temporária.');
    } catch (err) {
      console.error('Erro:', err);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">S</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gradient">SOS Comida</h1>
          </Link>
          <p className="text-slate-500 mt-2">Plataforma de Doações Solidárias</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {showChangePassword ? 'Criar Nova Senha' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-500">
              {showChangePassword 
                ? 'Defina uma senha segura para sua conta' 
                : 'Entre com suas credenciais para continuar'}
            </p>
          </div>
        
        {showChangePassword ? (
          // Formulário de alteração de senha
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3 text-amber-700 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Você está usando uma senha temporária. Crie uma nova senha para proteger sua conta.</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Nova Senha</label>
              <input 
                type="password" 
                value={novaSenha} 
                onChange={e => setNovaSenha(e.target.value)} 
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Confirmar Senha</label>
              <input 
                type="password" 
                value={confirmarSenha} 
                onChange={e => setConfirmarSenha(e.target.value)} 
                className="input-field"
                placeholder="Repita a nova senha"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Alterando...
                </span>
              ) : 'Alterar Senha e Entrar'}
            </button>
          </form>
        ) : (
          // Formulário de login normal
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">E-mail ou usuário</label>
              <input 
                value={usuario} 
                onChange={e => setUsuario(e.target.value)} 
                className="input-field"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Senha</label>
              <input 
                type="password" 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                theme="light"
              />
            </div>

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-center text-slate-500 hover:text-emerald-600 text-sm transition-colors py-2"
            >
              Esqueceu sua senha?
            </button>
          </form>
        )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500">
            Ainda não tem uma conta?{' '}
            <Link href="/registrar" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
