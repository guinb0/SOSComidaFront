'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, Receipt, Calendar } from 'lucide-react';

interface Comprovante {
  id: number;
  campanhaId: number;
  campanhaTitulo: string;
  doacaoId: number;
  valorDoacao: number;
  data: string;
  notasFiscais: {
    numeroNota: string;
    estabelecimento: string;
    data: string;
    valorTotal: number;
    fotoNota: string;
  }[];
  custoPlataforma: number;
  totalGasto: number;
}

export default function ComprovantesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [comprovantes, setComprovantes] = useState<Comprovante[]>([]);
  const [loading, setLoading] = useState(true);
  const [comprovanteExpandido, setComprovanteExpandido] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const comprovantesMock: Comprovante[] = [
      {
        id: 1,
        campanhaId: 1,
        campanhaTitulo: 'Alimentos para Famílias Carentes',
        doacaoId: 1,
        valorDoacao: 100,
        data: '2025-01-16T14:30:00',
        notasFiscais: [
          {
            numeroNota: '000.123.456',
            estabelecimento: 'Supermercado Economia',
            data: '2025-01-16T10:30:00',
            valorTotal: 56.70,
            fotoNota: 'https://images.unsplash.com/photo-1554224311-beee460201b4?w=800'
          },
          {
            numeroNota: '000.123.457',
            estabelecimento: 'Atacadão Central',
            data: '2025-01-16T11:15:00',
            valorTotal: 33.30,
            fotoNota: 'https://images.unsplash.com/photo-1612810806563-4cb8265db55f?w=800'
          }
        ],
        custoPlataforma: 10.00,
        totalGasto: 90.00
      },
      {
        id: 2,
        campanhaId: 2,
        campanhaTitulo: 'Cesta Básica para Idosos',
        doacaoId: 2,
        valorDoacao: 50,
        data: '2025-01-11T09:15:00',
        notasFiscais: [
          {
            numeroNota: '000.789.012',
            estabelecimento: 'Mercado Bom Preço',
            data: '2025-01-11T08:45:00',
            valorTotal: 45.00,
            fotoNota: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'
          }
        ],
        custoPlataforma: 5.00,
        totalGasto: 45.00
      }
    ];

    setComprovantes(comprovantesMock);
    setLoading(false);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/historico-doacoes')}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Histórico</span>
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Receipt className="text-emerald-400" size={36} />
              Histórico de Comprovantes
            </h1>
            <p className="text-slate-400">
              Transparência total: veja como cada real doado foi utilizado
            </p>
          </div>

          {loading ? (
            <div className="text-slate-400 text-center py-12">Carregando...</div>
          ) : comprovantes.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <p className="text-slate-400 text-lg">Nenhum comprovante disponível ainda</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comprovantes.map((comprovante) => {
                const isExpanded = comprovanteExpandido === comprovante.id;
                const dataCompra = new Date(comprovante.data);
                
                return (
                  <div
                    key={comprovante.id}
                    className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
                  >
                    {/* Header do Comprovante */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => setComprovanteExpandido(isExpanded ? null : comprovante.id)}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {comprovante.campanhaTitulo}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{dataCompra.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Receipt size={16} />
                              <span>Doação #{comprovante.doacaoId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-slate-400 mb-1">Sua doação</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            R$ {comprovante.valorDoacao.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400 mb-1">Usado em Compras</div>
                          <div className="text-lg font-bold text-white">
                            R$ {comprovante.totalGasto.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400 mb-1">Custo Plataforma (10%)</div>
                          <div className="text-lg font-bold text-white">
                            R$ {comprovante.custoPlataforma.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <div className="text-xs text-slate-400 mb-1">Notas Fiscais</div>
                          <div className="text-lg font-bold text-white">
                            {comprovante.notasFiscais.length}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-center text-sm text-slate-500">
                        {isExpanded ? '▲ Clique para ocultar detalhes' : '▼ Clique para ver detalhes e fotos'}
                      </div>
                    </div>

                    {/* Detalhes Expandidos */}
                    {isExpanded && (
                      <div className="border-t border-slate-700/50 p-6 bg-slate-900/50">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Receipt className="text-emerald-400" size={20} />
                          Notas Fiscais
                        </h4>
                        
                        <div className="space-y-4">
                          {comprovante.notasFiscais.map((nota, index) => {
                            const dataNota = new Date(nota.data);
                            
                            return (
                              <div
                                key={index}
                                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                              >
                                <div className="flex gap-4 flex-wrap md:flex-nowrap">
                                  <div className="w-full md:w-48 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                                    <img
                                      src={nota.fotoNota}
                                      alt={`Nota Fiscal ${nota.numeroNota}`}
                                      className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform"
                                      onClick={() => window.open(nota.fotoNota, '_blank')}
                                    />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                      <div>
                                        <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                                          <Receipt size={16} className="text-emerald-400" />
                                          Nota Fiscal Nº {nota.numeroNota}
                                        </h5>
                                        <div className="space-y-1 text-sm text-slate-400">
                                          <p><span className="text-slate-500">Estabelecimento:</span> <span className="text-white font-semibold">{nota.estabelecimento}</span></p>
                                          <p><span className="text-slate-500">Data:</span> <span className="text-white">{dataNota.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></p>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right">
                                        <div className="text-xs text-slate-400 mb-1">Valor Total</div>
                                        <div className="text-2xl font-bold text-emerald-400">
                                          R$ {nota.valorTotal.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-6 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
                          <h5 className="text-white font-semibold mb-3">Resumo Financeiro</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-300">Valor total da doação:</span>
                              <span className="text-white font-semibold">R$ {comprovante.valorDoacao.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Custo operacional (10%):</span>
                              <span className="text-white font-semibold">- R$ {comprovante.custoPlataforma.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-slate-700 my-2"></div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Soma das notas fiscais:</span>
                              <span className="text-white font-semibold">R$ {comprovante.notasFiscais.reduce((acc, nota) => acc + nota.valorTotal, 0).toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-slate-700 my-2"></div>
                            <div className="flex justify-between text-base">
                              <span className="text-emerald-400 font-semibold">Total investido em alimentos:</span>
                              <span className="text-emerald-400 font-bold">R$ {comprovante.totalGasto.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>
    </div>
  );
}
