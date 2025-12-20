"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

// Chave de teste do reCAPTCHA (substitua pela sua chave de produção)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              SOS Comida
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">
            {showChangePassword ? 'Alterar Senha' : 'Login'}
          </h2>
          <p className="text-white/60">
            {showChangePassword 
              ? 'Crie uma nova senha para sua conta' 
              : 'Entre na sua conta'}
          </p>
        </div>
        
        {showChangePassword ? (
          // Formulário de alteração de senha
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Você está usando uma senha temporária. Por favor, crie uma nova senha.</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Nova Senha</label>
              <input 
                type="password" 
                value={novaSenha} 
                onChange={e => setNovaSenha(e.target.value)} 
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-white"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Confirmar Nova Senha</label>
              <input 
                type="password" 
                value={confirmarSenha} 
                onChange={e => setConfirmarSenha(e.target.value)} 
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-white"
                placeholder="Repita a nova senha"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Alterando...' : 'Alterar Senha e Entrar'}
            </button>
          </form>
        ) : (
          // Formulário de login normal
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">E-mail</label>
              <input 
                value={usuario} 
                onChange={e => setUsuario(e.target.value)} 
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-white"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Senha</label>
              <input 
                type="password" 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-white"
                placeholder="Digite sua senha"
              />
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                theme="dark"
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-center text-white/60 hover:text-emerald-400 text-sm transition-colors"
            >
              Esqueci minha senha
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-white/60">
            Não tem uma conta?{' '}
            <Link href="/registrar" className="text-emerald-400 font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
