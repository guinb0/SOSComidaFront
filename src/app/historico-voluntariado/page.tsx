'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { Users, Calendar, Heart, CheckCircle, Clock, XCircle, Download, Award, MapPin } from 'lucide-react';

interface Voluntariado {
  id: number;
  campanhaId: number;
  campanhaTitulo: string;
  campanhaImagem: string;
  dataInscricao: string;
  dataInicio?: string;
  dataFim?: string;
  horasContribuidas: number;
  status: 'ativo' | 'concluido' | 'pendente' | 'cancelado';
  funcao: string;
  local?: string;
}

export default function HistoricoVoluntariadoPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [voluntariados, setVoluntariados] = useState<Voluntariado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'ativo' | 'concluido' | 'pendente' | 'cancelado'>('todos');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Dados mock - substituir por chamada real à API
    const voluntariadosMock: Voluntariado[] = [
      {
        id: 1,
        campanhaId: 1,
        campanhaTitulo: 'Alimentos para Famílias Carentes',
        campanhaImagem: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
        dataInscricao: '2025-01-10T08:00:00',
        dataInicio: '2025-01-15T09:00:00',
        dataFim: '2025-01-15T17:00:00',
        horasContribuidas: 8,
        status: 'concluido',
        funcao: 'Distribuição de Alimentos',
        local: 'Centro Comunitário São José'
      },
      {
        id: 2,
        campanhaId: 2,
        campanhaTitulo: 'Cesta Básica para Idosos',
        campanhaImagem: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        dataInscricao: '2025-01-08T10:00:00',
        dataInicio: '2025-01-12T08:00:00',
        dataFim: '2025-01-12T14:00:00',
        horasContribuidas: 6,
        status: 'concluido',
        funcao: 'Montagem de Cestas',
        local: 'Associação dos Idosos'
      },
      {
        id: 3,
        campanhaId: 3,
        campanhaTitulo: 'Sopa Solidária - Inverno 2025',
        campanhaImagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        dataInscricao: '2025-01-20T14:00:00',
        horasContribuidas: 0,
        status: 'ativo',
        funcao: 'Preparo de Refeições',
        local: 'Cozinha Comunitária'
      },
      {
        id: 4,
        campanhaId: 4,
        campanhaTitulo: 'Natal Solidário 2024',
        campanhaImagem: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800',
        dataInscricao: '2024-12-15T09:00:00',
        dataInicio: '2024-12-24T08:00:00',
        dataFim: '2024-12-24T18:00:00',
        horasContribuidas: 10,
        status: 'concluido',
        funcao: 'Entrega de Presentes',
        local: 'Comunidade Vila Nova'
      }
    ];

    setVoluntariados(voluntariadosMock);
    setLoading(false);
  }, [isAuthenticated, router]);

  const gerarCertificadoParticipacao = async (voluntariado: Voluntariado) => {
    // @ts-ignore - pdfMake não tem tipos completos
    const pdfMake = (await import('pdfmake/build/pdfmake')).default;
    // @ts-ignore
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
    const { LOGO_BASE64 } = await import('@/lib/logo-base64');
    (pdfMake as any).vfs = pdfFonts;

    const dataInscricao = new Date(voluntariado.dataInscricao);
    const dataFormatada = voluntariado.dataInicio 
      ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(voluntariado.dataInicio))
      : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(dataInscricao);

    const codigoAutenticacao = `VOL-${voluntariado.id.toString().padStart(8, '0')}-${dataInscricao.getFullYear()}`;

    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [0, 0, 0, 0],
      background: function() {
        return {
          canvas: [
            // Fundo
            {
              type: 'rect',
              x: 0, y: 0,
              w: 842, h: 595,
              color: '#fafbfc'
            },
            // Borda externa roxa
            {
              type: 'rect',
              x: 15, y: 15,
              w: 812, h: 565,
              lineWidth: 3,
              lineColor: '#7c3aed'
            },
            // Borda interna dupla
            {
              type: 'rect',
              x: 25, y: 25,
              w: 792, h: 545,
              lineWidth: 1,
              lineColor: '#a78bfa'
            },
            {
              type: 'rect',
              x: 30, y: 30,
              w: 782, h: 535,
              lineWidth: 0.5,
              lineColor: '#c4b5fd'
            },
            // Cantos decorativos superior esquerdo
            {
              type: 'line',
              x1: 35, y1: 55,
              x2: 35, y2: 35,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            {
              type: 'line',
              x1: 35, y1: 35,
              x2: 55, y2: 35,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            // Cantos decorativos superior direito
            {
              type: 'line',
              x1: 807, y1: 55,
              x2: 807, y2: 35,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            {
              type: 'line',
              x1: 807, y1: 35,
              x2: 787, y2: 35,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            // Cantos decorativos inferior esquerdo
            {
              type: 'line',
              x1: 35, y1: 540,
              x2: 35, y2: 560,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            {
              type: 'line',
              x1: 35, y1: 560,
              x2: 55, y2: 560,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            // Cantos decorativos inferior direito
            {
              type: 'line',
              x1: 807, y1: 540,
              x2: 807, y2: 560,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            {
              type: 'line',
              x1: 807, y1: 560,
              x2: 787, y2: 560,
              lineWidth: 2,
              lineColor: '#7c3aed'
            },
            // Linha decorativa horizontal superior
            {
              type: 'line',
              x1: 100, y1: 100,
              x2: 742, y2: 100,
              lineWidth: 0.5,
              lineColor: '#a78bfa'
            },
            // Linha decorativa horizontal inferior
            {
              type: 'line',
              x1: 100, y1: 495,
              x2: 742, y2: 495,
              lineWidth: 0.5,
              lineColor: '#a78bfa'
            }
          ]
        };
      },
      content: [
        // Cabeçalho com logo
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              stack: [
                {
                  image: LOGO_BASE64,
                  width: 70,
                  alignment: 'center'
                }
              ]
            },
            { width: '*', text: '' }
          ],
          margin: [0, 45, 0, 10]
        },
        // Título principal
        {
          text: 'CERTIFICADO DE PARTICIPAÇÃO',
          fontSize: 30,
          bold: true,
          alignment: 'center',
          color: '#1a365d',
          margin: [0, 5, 0, 5],
          characterSpacing: 3
        },
        // Subtítulo
        {
          text: 'TRABALHO VOLUNTÁRIO',
          fontSize: 11,
          alignment: 'center',
          color: '#7c3aed',
          margin: [0, 0, 0, 25],
          characterSpacing: 6
        },
        // Texto principal
        {
          text: 'A Plataforma SOS Comida certifica que',
          fontSize: 12,
          alignment: 'center',
          color: '#4a5568',
          margin: [60, 0, 60, 15]
        },
        // Nome do voluntário
        {
          text: user?.nome || 'Voluntário',
          fontSize: 26,
          bold: true,
          alignment: 'center',
          color: '#1a365d',
          margin: [60, 0, 60, 15]
        },
        // Texto de contribuição
        {
          text: 'participou como voluntário(a) na campanha',
          fontSize: 12,
          alignment: 'center',
          color: '#4a5568',
          margin: [60, 0, 60, 10]
        },
        // Nome da campanha
        {
          text: `"${voluntariado.campanhaTitulo}"`,
          fontSize: 18,
          bold: true,
          alignment: 'center',
          color: '#7c3aed',
          margin: [60, 0, 60, 15]
        },
        // Função e horas
        {
          text: `exercendo a função de ${voluntariado.funcao}`,
          fontSize: 12,
          alignment: 'center',
          color: '#4a5568',
          margin: [60, 0, 60, 10]
        },
        // Horas contribuídas em destaque
        {
          text: `${voluntariado.horasContribuidas} horas de trabalho voluntário`,
          fontSize: 22,
          bold: true,
          color: '#10b981',
          alignment: 'center',
          margin: [0, 5, 0, 15]
        },
        // Informações adicionais
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                widths: ['auto', 'auto'],
                body: [
                  [
                    { text: 'Data:', fontSize: 9, color: '#718096', alignment: 'right', margin: [0, 2, 10, 2] },
                    { text: dataFormatada, fontSize: 9, color: '#2d3748', bold: true, alignment: 'left', margin: [0, 2, 0, 2] }
                  ],
                  [
                    { text: 'Local:', fontSize: 9, color: '#718096', alignment: 'right', margin: [0, 2, 10, 2] },
                    { text: voluntariado.local || 'Não especificado', fontSize: 9, color: '#2d3748', bold: true, alignment: 'left', margin: [0, 2, 0, 2] }
                  ]
                ]
              },
              layout: 'noBorders'
            },
            { width: '*', text: '' }
          ],
          margin: [0, 0, 0, 20]
        },
        // Mensagem de agradecimento
        {
          text: '"Sua dedicação e solidariedade fazem a diferença na vida de muitas pessoas."',
          fontSize: 11,
          italics: true,
          alignment: 'center',
          color: '#718096',
          margin: [80, 0, 80, 30]
        },
        // Assinatura centralizada
        {
          text: '____________________________________',
          alignment: 'center',
          fontSize: 10,
          color: '#cbd5e0',
          margin: [0, 0, 0, 5]
        },
        {
          text: 'Maria Silva Santos',
          alignment: 'center',
          fontSize: 11,
          bold: true,
          color: '#1a365d'
        },
        {
          text: 'Diretora Executiva - SOS Comida',
          alignment: 'center',
          fontSize: 9,
          color: '#718096',
          margin: [0, 2, 0, 20]
        },
        // Código de autenticação
        {
          text: `Código de Autenticação: ${codigoAutenticacao}`,
          alignment: 'center',
          fontSize: 8,
          color: '#2d3748',
          bold: true
        }
      ],
      footer: {
        text: `Emitido em ${new Date().toLocaleDateString('pt-BR')} • Este documento é válido como comprovante de participação voluntária • www.soscomida.org.br`,
        fontSize: 7,
        color: '#a0aec0',
        alignment: 'center',
        margin: [0, 0, 0, 25]
      }
    };

    pdfMake.createPdf(docDefinition).download(`Certificado-Voluntariado-${voluntariado.id}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="text-emerald-400" size={20} />;
      case 'ativo':
        return <Clock className="text-blue-400" size={20} />;
      case 'pendente':
        return <Clock className="text-yellow-400" size={20} />;
      case 'cancelado':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <Clock className="text-slate-400" size={20} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'ativo':
        return 'Ativo';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-emerald-100 text-emerald-700';
      case 'ativo':
        return 'bg-blue-100 text-blue-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const voluntariadosFiltrados = voluntariados.filter(v => 
    filtro === 'todos' || v.status === filtro
  );

  const totalHoras = voluntariados
    .filter(v => v.status === 'concluido')
    .reduce((acc, v) => acc + v.horasContribuidas, 0);

  const totalCampanhas = new Set(voluntariados.map(v => v.campanhaId)).size;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Histórico de Voluntariado
            </h1>
            <p className="text-slate-600 mt-2">Acompanhe suas participações e baixe certificados</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{voluntariados.length}</p>
                  <p className="text-sm text-slate-500">Participações</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Clock className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalHoras}h</p>
                  <p className="text-sm text-slate-500">Horas Contribuídas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Heart className="text-pink-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalCampanhas}</p>
                  <p className="text-sm text-slate-500">Campanhas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['todos', 'ativo', 'concluido', 'pendente', 'cancelado'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFiltro(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filtro === status
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {status === 'todos' ? 'Todos' : getStatusLabel(status)}
              </button>
            ))}
          </div>

          {/* Lista de Voluntariados */}
          <div className="space-y-4">
            {voluntariadosFiltrados.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Users className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">Nenhum voluntariado encontrado</p>
              </div>
            ) : (
              voluntariadosFiltrados.map((voluntariado) => (
                <div
                  key={voluntariado.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Imagem */}
                    <div className="md:w-48 h-32 md:h-auto relative">
                      <img
                        src={voluntariado.campanhaImagem}
                        alt={voluntariado.campanhaTitulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voluntariado.status)}`}>
                          {getStatusLabel(voluntariado.status)}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-slate-800 mb-2">
                            {voluntariado.campanhaTitulo}
                          </h3>
                          
                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Award size={16} className="text-purple-500" />
                              <span>{voluntariado.funcao}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-slate-400" />
                              <span>
                                Inscrito em {new Date(voluntariado.dataInscricao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            
                            {voluntariado.local && (
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-slate-400" />
                                <span>{voluntariado.local}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Horas e Ações */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                              {voluntariado.horasContribuidas}h
                            </p>
                            <p className="text-xs text-slate-500">contribuídas</p>
                          </div>

                          {voluntariado.status === 'concluido' && (
                            <button
                              onClick={() => gerarCertificadoParticipacao(voluntariado)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-200 transition-all"
                            >
                              <Download size={16} />
                              Certificado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
