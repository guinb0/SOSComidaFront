'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GovBrCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Erro na autenticação com gov.br');
      setTimeout(() => router.push('/registrar'), 3000);
      return;
    }

    if (code) {
      handleGovBrCallback(code);
    }
  }, [searchParams, router]);

  const handleGovBrCallback = async (code: string) => {
    try {
      // Trocar o code por access token
      const response = await fetch('/api/auth/govbr/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error('Falha ao obter token');

      const data = await response.json();
      
      // Redirecionar para registrar com os dados preenchidos
      router.push(`/registrar?govbr=true&data=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (err) {
      setError('Erro ao processar autenticação');
      setTimeout(() => router.push('/registrar'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Erro na Autenticação</h2>
            <p className="text-white/60">{error}</p>
            <p className="text-white/40 text-sm mt-4">Redirecionando...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="animate-spin w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Processando Autenticação</h2>
            <p className="text-white/60">Aguarde enquanto validamos seus dados...</p>
          </>
        )}
      </div>
    </div>
  );
}
