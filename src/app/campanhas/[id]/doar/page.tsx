'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, ShoppingCart, Package, Utensils, Users, CheckCircle2 } from 'lucide-react';
import { CampanhaDto } from '@/types';

export default function DoarCampanhaPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [campanha, setCampanha] = useState<CampanhaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [valorDoacao, setValorDoacao] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'credito' | 'debito'>('pix');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const carregarCampanha = async () => {
      try {
        const id = parseInt(params.id as string);
        const response = await fetch(`http://localhost:5118/api/campanhas/${id}`);
        const data = await response.json();
        setCampanha(data);
      } catch (error) {
        console.error('Erro ao carregar campanha:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCampanha();
  }, [isAuthenticated, router, params.id]);

  const handleDoacao = async () => {
    if (!valorDoacao || parseFloat(valorDoacao) <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }
    
    try {
      // Adicionar como participante da campanha (doador)
      await fetch(`http://localhost:5118/api/campanhas/${params.id}/participantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campanhaId: parseInt(params.id as string),
          usuarioId: user?.id,
          tipo: 'doador'
        })
      });
    } catch (error) {
      // Ignora erro se já for participante
      console.log('Usuário pode já ser participante');
    }
    
    // Aqui você implementaria a lógica de pagamento real
    alert(`Doação de R$ ${parseFloat(valorDoacao).toFixed(2)} confirmada! Obrigado por ajudar! Agora você pode acessar o chat da campanha.`);
    router.push('/historico-doacoes');
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!campanha) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-slate-400">Campanha não encontrada</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push(`/campanhas/${params.id}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Detalhes</span>
          </button>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-8 border-b border-slate-700/50">
              <h1 className="text-3xl font-bold text-white mb-2">Fazer Doação</h1>
              <p className="text-slate-400">{campanha.titulo}</p>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <ShoppingCart className="text-emerald-400" size={28} />
                  Como sua doação será utilizada
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-emerald-500/20 rounded-lg">
                        <Package className="text-emerald-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">R$ 50,00</h3>
                        <p className="text-slate-300 text-sm">1 cesta básica completa com arroz, feijão, óleo, açúcar e itens essenciais</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Utensils className="text-blue-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">R$ 100,00</h3>
                        <p className="text-slate-300 text-sm">2 cestas básicas + kit higiene com sabonete, pasta de dente e shampoo</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Users className="text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">R$ 200,00</h3>
                        <p className="text-slate-300 text-sm">Alimentação completa para uma família de 4 pessoas por 1 mês</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-pink-500/20 rounded-lg">
                        <CheckCircle2 className="text-pink-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Valor Personalizado</h3>
                        <p className="text-slate-300 text-sm">Qualquer valor faz a diferença! Cada real ajuda a combater a fome</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    Garantias da sua doação
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>90% do valor doado vai direto para a compra de alimentos (10% custos da plataforma)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Você receberá um certificado digital da sua doação</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Transparência total: acompanhe o impacto da sua contribuição</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>Recibos e comprovantes disponíveis no seu histórico</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3">Valor da Doação (R$)</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[50, 100, 200].map((valor) => (
                      <button
                        key={valor}
                        onClick={() => setValorDoacao(valor.toString())}
                        className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                          valorDoacao === valor.toString()
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        R$ {valor}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={valorDoacao}
                    onChange={(e) => setValorDoacao(e.target.value)}
                    placeholder="Ou digite outro valor"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    min="1"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">Método de Pagamento</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setMetodoPagamento('pix')}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        metodoPagamento === 'pix'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      PIX
                    </button>
                    <button
                      onClick={() => setMetodoPagamento('credito')}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        metodoPagamento === 'credito'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Crédito
                    </button>
                    <button
                      onClick={() => setMetodoPagamento('debito')}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        metodoPagamento === 'debito'
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Débito
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDoacao}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
                >
                  Confirmar Doação de R$ {valorDoacao ? parseFloat(valorDoacao).toFixed(2) : '0,00'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>
    </div>
  );
}
