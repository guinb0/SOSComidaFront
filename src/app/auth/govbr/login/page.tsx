'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GovBrLoginSimulator() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      // Dados simulados do gov.br
      const mockData = {
        name: 'João da Silva',
        email: 'joao.silva@example.com',
        phoneNumber: '61999887766',
        cpf: cpf.replace(/\D/g, ''),
      };

      // Redirecionar de volta para registro com os dados
      router.push(`/registrar?govbr=true&data=${encodeURIComponent(JSON.stringify(mockData))}`);
    }, 1500);
  };

  const handleCancel = () => {
    router.push('/registrar');
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-[#071D41] flex flex-col">
      {/* Header gov.br */}
      <header className="bg-[#1351B4] py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1351B4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-2xl font-bold">gov.br</div>
              <div className="text-blue-200 text-xs">Governo Federal</div>
            </div>
          </div>
        </div>
      </header>

      {/* Modo Desenvolvimento Badge */}
      <div className="bg-yellow-500 text-black text-center py-2 px-4 font-bold">
        ⚠️ MODO DESENVOLVIMENTO - Simulação de Login gov.br
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Entrar com gov.br
            </h1>
            <p className="text-gray-600 text-sm">
              Faça login com sua conta gov.br
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1351B4] focus:outline-none text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1351B4] focus:outline-none text-gray-800"
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-[#1351B4] text-sm hover:underline">
                Esqueci minha senha
              </a>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !cpf || !senha}
                className="flex-1 px-6 py-3 bg-[#1351B4] text-white rounded-lg font-semibold hover:bg-[#0c3c8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Autenticando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Não tem conta gov.br?
            </p>
            <a
              href="https://www.gov.br/pt-br/servicos/criar-sua-conta-gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1351B4] font-semibold hover:underline"
            >
              Criar conta gov.br
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#071D41] py-6 text-center text-white/60 text-sm">
        <p>© 2024 Governo Federal - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
