'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { DollarSign, Calendar, Heart, CheckCircle, Clock, XCircle, Download, Truck, Receipt } from 'lucide-react';

interface Doacao {
  id: number;
  campanhaId: number;
  campanhaTitulo: string;
  campanhaImagem: string;
  valor: number;
  data: string;
  status: 'concluida' | 'pendente' | 'cancelada' | 'em-andamento';
  metodoPagamento: string;
}

export default function HistoricoDoacoesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'concluida' | 'pendente' | 'cancelada' | 'em-andamento'>('todas');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const doacoesMock: Doacao[] = [
      {
        id: 1,
        campanhaId: 1,
        campanhaTitulo: 'Alimentos para Famílias Carentes',
        campanhaImagem: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
        valor: 100,
        data: '2025-01-15T10:30:00',
        status: 'concluida',
        metodoPagamento: 'PIX'
      },
      {
        id: 2,
        campanhaId: 2,
        campanhaTitulo: 'Cesta Básica para Idosos',
        campanhaImagem: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        valor: 50,
        data: '2025-01-10T14:20:00',
        status: 'concluida',
        metodoPagamento: 'Cartão de Crédito'
      },
      {
        id: 3,
        campanhaId: 3,
        campanhaTitulo: 'Sopa Solidária - Inverno 2025',
        campanhaImagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        valor: 75,
        data: '2025-01-05T16:45:00',
        status: 'concluida',
        metodoPagamento: 'PIX'
      },
      {
        id: 4,
        campanhaId: 1,
        campanhaTitulo: 'Alimentos para Famílias Carentes',
        campanhaImagem: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
        valor: 200,
        data: '2024-12-28T09:15:00',
        status: 'concluida',
        metodoPagamento: 'PIX'
      },
      {
        id: 5,
        campanhaId: 2,
        campanhaTitulo: 'Cesta Básica para Idosos',
        campanhaImagem: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        valor: 150,
        data: '2025-01-18T11:20:00',
        status: 'em-andamento',
        metodoPagamento: 'PIX'
      }
    ];

    setDoacoes(doacoesMock);
    setLoading(false);
  }, [isAuthenticated, router]);

  const gerarCertificado = async (doacao: Doacao) => {
    // @ts-ignore - pdfMake não tem tipos completos
    const pdfMake = (await import('pdfmake/build/pdfmake')).default;
    // @ts-ignore
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
    const { LOGO_BASE64 } = await import('@/lib/logo-base64');
    (pdfMake as any).vfs = pdfFonts;

    const dataDoacao = new Date(doacao.data);
    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dataDoacao);

    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Logo centralizada
        {
          image: LOGO_BASE64,
          width: 80,
          alignment: 'center',
          margin: [0, 0, 0, 15]
        },
        { text: 'CERTIFICADO DE DOAÇÃO', fontSize: 28, bold: true, alignment: 'center', margin: [0, 0, 0, 25], color: '#10b981' },
        { text: '\n' },
        {
          text: [
            'Certificamos que ',
            { text: user?.nome || 'Doador', bold: true, color: '#10b981' },
            ', realizou uma doação no valor de '
          ],
          fontSize: 14,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: `R$ ${doacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          fontSize: 32,
          bold: true,
          alignment: 'center',
          color: '#10b981',
          margin: [0, 0, 0, 20]
        },
        {
          text: [
            'para a campanha ',
            { text: `"${doacao.campanhaTitulo}"`, bold: true, color: '#3b82f6' },
            ', através da plataforma SOS Comida.'
          ],
          fontSize: 14,
          alignment: 'center',
          margin: [0, 0, 0, 30]
        },
        {
          text: `Método de Pagamento: ${doacao.metodoPagamento}`,
          fontSize: 11,
          alignment: 'center',
          color: '#64748b',
          margin: [0, 0, 0, 5]
        },
        {
          text: `Data da Doação: ${dataFormatada}`,
          fontSize: 11,
          alignment: 'center',
          color: '#64748b',
          margin: [0, 0, 0, 5]
        },
        {
          text: `ID da Transação: #${doacao.id.toString().padStart(8, '0')}`,
          fontSize: 11,
          alignment: 'center',
          color: '#64748b',
          margin: [0, 0, 0, 40]
        },
        {
          text: 'Agradecemos sua generosidade e compromisso em fazer a diferença!',
          fontSize: 13,
          italics: true,
          alignment: 'center',
          color: '#475569',
          margin: [0, 0, 0, 50]
        },
        // Assinatura
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              stack: [
                // Simulação de assinatura cursiva
                {
                  canvas: [
                    // Linha da assinatura (simulando escrita cursiva)
                    {
                      type: 'polyline',
                      lineWidth: 2,
                      closePath: false,
                      points: [
                        { x: 20, y: 10 },
                        { x: 30, y: 5 },
                        { x: 40, y: 15 },
                        { x: 50, y: 8 },
                        { x: 60, y: 12 },
                        { x: 70, y: 6 },
                        { x: 85, y: 10 },
                        { x: 95, y: 8 },
                        { x: 110, y: 12 },
                        { x: 125, y: 10 },
                        { x: 140, y: 15 },
                        { x: 155, y: 8 },
                        { x: 170, y: 12 },
                        { x: 180, y: 10 }
                      ],
                      color: '#1e40af'
                    }
                  ],
                  margin: [0, 0, 0, 10]
                },
                {
                  text: '_________________________________',
                  alignment: 'center',
                  margin: [0, 0, 0, 5]
                },
                {
                  text: 'Maria Silva Santos',
                  alignment: 'center',
                  fontSize: 11,
                  bold: true,
                  color: '#1e293b'
                },
                {
                  text: 'Diretora Executiva',
                  alignment: 'center',
                  fontSize: 10,
                  color: '#64748b',
                  margin: [0, 2, 0, 0]
                },
                {
                  text: 'SOS Comida',
                  alignment: 'center',
                  fontSize: 10,
                  color: '#64748b'
                },
                {
                  text: 'Plataforma de Doações',
                  alignment: 'center',
                  fontSize: 8,
                  color: '#94a3b8'
                }
              ]
            },
            { width: '*', text: '' }
          ]
        }
      ]
    };

    pdfMake.createPdf(docDefinition).download(`Certificado-Doacao-${doacao.id}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="text-emerald-400" size={20} />;
      case 'pendente':
        return <Clock className="text-yellow-400" size={20} />;
      case 'cancelada':
        return <XCircle className="text-red-400" size={20} />;
      case 'em-andamento':
        return <Truck className="text-blue-400" size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'pendente':
        return 'Pendente';
      case 'cancelada':
        return 'Cancelada';
      case 'em-andamento':
        return 'Em Andamento';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelada':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'em-andamento':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatData = (dataString: string) => {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const doacoesFiltradas = filtro === 'todas' 
    ? doacoes 
    : doacoes.filter(d => d.status === filtro);

  const totalDoado = doacoes
    .filter(d => d.status === 'concluida')
    .reduce((total, d) => total + d.valor, 0);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Histórico de Doações</h1>
            <p className="text-slate-400">
              Acompanhe todas as suas contribuições
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-slate-300 font-semibold">Total Doado</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                R$ {totalDoado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Heart className="text-blue-400" size={24} />
                </div>
                <h3 className="text-slate-300 font-semibold">Campanhas Apoiadas</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {new Set(doacoes.map(d => d.campanhaId)).size}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <CheckCircle className="text-purple-400" size={24} />
                </div>
                <h3 className="text-slate-300 font-semibold">Doações Realizadas</h3>
              </div>
              <p className="text-3xl font-bold text-white">
                {doacoes.filter(d => d.status === 'concluida').length}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'todas'
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('concluida')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'concluida'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFiltro('pendente')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'pendente'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltro('cancelada')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'cancelada'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Canceladas
            </button>
            <button
              onClick={() => setFiltro('em-andamento')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'em-andamento'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Em Andamento
            </button>
          </div>

          {loading ? (
            <div className="text-slate-400 text-center py-12">Carregando...</div>
          ) : doacoesFiltradas.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
              <p className="text-slate-400 text-lg mb-4">Nenhuma doação encontrada</p>
              <p className="text-slate-500">Faça sua primeira doação e ajude quem mais precisa!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {doacoesFiltradas.map((doacao) => (
                <div
                  key={doacao.id}
                  className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center gap-6 p-6">
                    <div className="hidden md:block w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={doacao.campanhaImagem}
                        alt={doacao.campanhaTitulo}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 truncate">
                        {doacao.campanhaTitulo}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatData(doacao.data)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <span>{doacao.metodoPagamento}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-2xl font-bold text-emerald-400">
                        R$ {doacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(doacao.status)}`}>
                        {getStatusIcon(doacao.status)}
                        <span className="text-sm font-semibold">{getStatusText(doacao.status)}</span>
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        {doacao.status === 'concluida' && (
                          <>
                            <button
                              onClick={() => gerarCertificado(doacao)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all text-sm"
                            >
                              <Download size={16} />
                              Certificado
                            </button>
                            <button
                              onClick={() => router.push('/historico-doacoes/comprovantes')}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all text-sm"
                            >
                              <Receipt size={16} />
                              Comprovantes
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
