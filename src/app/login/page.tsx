"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('guinb');
  const [senha, setSenha] = useState('123');
  const [error, setError] = useState('');
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setRequires2FA = useAuthStore((s) => s.setRequires2FA);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Tentando login com:', { email: usuario, senha });
      const res = await authService.login({ email: usuario, senha });
      console.log('Resposta do login:', res);
      setUser(res.usuario);
      setToken(res.token);
      setRequires2FA(!!res.requires2FA);
      router.push('/');
    } catch (err: any) {
      console.error('Erro no login:', err);
      console.error('Erro detalhado:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Usuário ou senha inválidos');
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <label>Usuário</label>
          <input value={usuario} onChange={e => setUsuario(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4 }}>Entrar</button>
      </form>
    </main>
  );
}
