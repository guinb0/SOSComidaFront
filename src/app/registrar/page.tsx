'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { govbrService } from '@/lib/api/services/govbr.service';
import { Building2, User, Info, MapPin, AlertCircle } from 'lucide-react';

interface Regiao {
  id: number;
  nome: string;
  sigla: string;
}

export default function RegistrarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tipoConta, setTipoConta] = useState<'doador' | 'instituicao'>('doador');
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    endereco: '',
    cidade: '',
    cpf: '',
    // Campos de instituição
    cnpj: '',
    nomeInstituicao: '',
    descricaoInstituicao: '',
    regiaoAdministrativaId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [govbrLoading, setGovbrLoading] = useState(false);
  const [fromGovBr, setFromGovBr] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Carregar regiões administrativas
  useEffect(() => {
    const carregarRegioes = async () => {
      try {
        const response = await fetch('http://localhost:5118/api/regioes');
        if (response.ok) {
          const data = await response.json();
          setRegioes(data);
        }
      } catch (error) {
        console.error('Erro ao carregar regiões:', error);
      }
    };
    carregarRegioes();
  }, []);

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

    // Validar senha
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    // Validações específicas para instituição
    if (tipoConta === 'instituicao') {
      if (!formData.nomeInstituicao.trim()) {
        setError('O nome da instituição é obrigatório');
        return;
      }
      if (!formData.regiaoAdministrativaId) {
        setError('Selecione a região administrativa onde a instituição está localizada');
        return;
      }
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        endereco: formData.endereco,
        cidade: formData.cidade,
        tipo: tipoConta === 'doador' ? 'usuario' : 'instituicao'
      };

      if (tipoConta === 'doador') {
        payload.cpf = formData.cpf || null;
      } else {
        payload.cnpj = formData.cnpj || null;
        payload.nomeInstituicao = formData.nomeInstituicao;
        payload.descricaoInstituicao = formData.descricaoInstituicao || null;
        payload.regiaoAdministrativaId = parseInt(formData.regiaoAdministrativaId);
      }

      const response = await fetch('http://localhost:5118/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      if (tipoConta === 'instituicao') {
        setMensagemSucesso(data.message);
        setSucesso(true);
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Tela de sucesso para instituições
  if (sucesso && tipoConta === 'instituicao') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Cadastro Enviado!</h2>
            <p className="text-slate-600 mb-6">{mensagemSucesso}</p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-amber-800 font-medium">Próximos passos:</p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• Sua instituição será analisada pelos moderadores</li>
                    <li>• Você receberá uma notificação quando for aprovada</li>
                    <li>• Após aprovação, poderá receber campanhas delegadas</li>
                  </ul>
                </div>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-block w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl font-bold text-white hover:scale-105 transition-transform"
            >
              Ir para Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 flex items-center justify-center p-6">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              SOS Comida
            </h1>
          </Link>
          <h2 className="text-4xl font-bold mb-3 text-slate-900">Criar Conta</h2>
          <p className="text-slate-600 text-lg">Junte-se a nós e faça a diferença</p>
        </div>

        {/* Form Card */}
        <div className="bg-white backdrop-blur-2xl border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl">
          {/* Seletor de Tipo de Conta */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3 text-slate-700">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipoConta('doador')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  tipoConta === 'doador'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <User className={`w-8 h-8 ${tipoConta === 'doador' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`font-semibold ${tipoConta === 'doador' ? 'text-emerald-700' : 'text-slate-600'}`}>
                  Pessoa Física
                </span>
                <span className="text-xs text-slate-500">Quero doar ou criar campanhas</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoConta('instituicao')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  tipoConta === 'instituicao'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Building2 className={`w-8 h-8 ${tipoConta === 'instituicao' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`font-semibold ${tipoConta === 'instituicao' ? 'text-blue-700' : 'text-slate-600'}`}>
                  Instituição
                </span>
                <span className="text-xs text-slate-500">ONG, igreja, associação...</span>
              </button>
            </div>
          </div>

          {/* Aviso para instituições */}
          {tipoConta === 'instituicao' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Cadastro de Instituição</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Instituições precisam ser aprovadas pelos moderadores antes de poderem receber campanhas delegadas. 
                    <strong className="block mt-1">Recomendamos usar um email corporativo</strong> (ex: contato@suainstituicao.org.br) 
                    para facilitar a validação.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gov.br Login Option - apenas para pessoa física */}
          {tipoConta === 'doador' && (
            <div className="mb-8">
              <button
                type="button"
                onClick={handleGovBrLogin}
                disabled={govbrLoading}
                className="w-full py-5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-400 text-sm font-semibold">OU</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Campos específicos para instituição */}
            {tipoConta === 'instituicao' && (
              <>
                {/* Nome da Instituição */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Nome da Instituição *
                  </label>
                  <input
                    type="text"
                    name="nomeInstituicao"
                    value={formData.nomeInstituicao}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                    placeholder="Nome fantasia da instituição"
                  />
                </div>

                {/* Região Administrativa */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Região Administrativa do DF *
                  </label>
                  <select
                    name="regiaoAdministrativaId"
                    value={formData.regiaoAdministrativaId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900"
                  >
                    <option value="">Selecione a região...</option>
                    {regioes.map(regiao => (
                      <option key={regiao.id} value={regiao.id}>
                        {regiao.nome} ({regiao.sigla})
                      </option>
                    ))}
                  </select>
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    CNPJ (opcional)
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                {/* Descrição da Instituição */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Descrição da Instituição
                  </label>
                  <textarea
                    name="descricaoInstituicao"
                    value={formData.descricaoInstituicao}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400 resize-none"
                    placeholder="Descreva brevemente a atuação da sua instituição..."
                  />
                </div>

                <div className="h-px bg-slate-200 my-2" />
                <p className="text-sm text-slate-500 font-medium">Dados do responsável:</p>
              </>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                {tipoConta === 'instituicao' ? 'Nome do Responsável' : 'Nome Completo'}
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                E-mail {tipoConta === 'instituicao' && <span className="text-blue-600 text-xs">(corporativo recomendado)</span>}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                placeholder={tipoConta === 'instituicao' ? 'contato@suainstituicao.org.br' : 'seu@email.com'}
              />
            </div>

            {/* Senha e Confirmar Senha */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Senha
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            {/* Telefone e CPF (apenas para pessoa física) */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {tipoConta === 'doador' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    CPF (opcional)
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                    placeholder="000.000.000-00"
                  />
                </div>
              )}
            </div>

            {/* Endereço e Cidade */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Rua, número"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
                  placeholder="Sua cidade"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-xl font-bold text-lg text-white transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                tipoConta === 'instituicao'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)]'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {tipoConta === 'instituicao' ? 'Enviando cadastro...' : 'Criando conta...'}
                </span>
              ) : (
                tipoConta === 'instituicao' ? 'Enviar Cadastro para Análise' : 'Criar Conta'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-slate-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-semibold transition-colors">
                Fazer Login
              </Link>
            </p>
            <Link href="/" className="block text-slate-400 hover:text-slate-600 transition-colors">
              ← Voltar para início
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className={`p-6 backdrop-blur-lg border rounded-2xl shadow-sm transition-all ${
            tipoConta === 'doador' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
          }`}>
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold mb-1 text-slate-900">Para Doadores</h3>
            <p className="text-sm text-slate-600">Contribua com campanhas e veja o impacto real</p>
          </div>
          <div className={`p-6 backdrop-blur-lg border rounded-2xl shadow-sm transition-all ${
            tipoConta === 'instituicao' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
          }`}>
            <div className="text-3xl mb-2">🏢</div>
            <h3 className="font-bold mb-1 text-slate-900">Para Instituições</h3>
            <p className="text-sm text-slate-600">Receba campanhas delegadas e alcance mais doadores</p>
          </div>
        </div>
      </div>
    </div>
  );
}
