'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { 
  ArrowLeft,
  History,
  MapPin,
  Building2,
  Map,
  Users,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface HistoricoModerador {
  id: number;
  moderadorId: number;
  moderadorNome: string;
  acao: 'criacao' | 'edicao' | 'ativacao' | 'desativacao' | 'exclusao' | 'moderacao_campanha';
  descricao: string;
  data: string;
  bairro: string;
  regiaoAdm: string; // Região Administrativa (ex: RA Taguatinga, RA Ceilândia)
  cidade: string;
}

type Agrupamento = 'todos' | 'bairro' | 'regiaoAdm' | 'cidade';

export default function HistoricoModeradoresPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [historico, setHistorico] = useState<HistoricoModerador[]>([]);
  const [agrupamento, setAgrupamento] = useState<Agrupamento>('todos');
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email !== 'guinb@soscomida.com') {
      router.push('/inicio');
      return;
    }

    carregarHistorico();
  }, [user, router]);

  const carregarHistorico = () => {
    // Mock data - em produção virá da API
    // Usando Regiões Administrativas como no DF
    const mockHistorico: HistoricoModerador[] = [
      {
        id: 1,
        moderadorId: 1,
        moderadorNome: 'Guilherme Nobrega',
        acao: 'criacao',
        descricao: 'Conta de super-moderador criada',
        data: '2024-01-01T00:00:00',
        bairro: 'Asa Sul',
        regiaoAdm: 'RA I - Plano Piloto',
        cidade: 'Brasília - DF'
      },
      {
        id: 2,
        moderadorId: 2,
        moderadorNome: 'Ana Paula Silva',
        acao: 'criacao',
        descricao: 'Moderador criado por Guilherme Nobrega',
        data: '2024-11-15T10:30:00',
        bairro: 'Centro',
        regiaoAdm: 'RA III - Taguatinga',
        cidade: 'Brasília - DF'
      },
      {
        id: 3,
        moderadorId: 2,
        moderadorNome: 'Ana Paula Silva',
        acao: 'moderacao_campanha',
        descricao: 'Pausou campanha "Alimentos para Famílias Carentes"',
        data: '2024-11-20T14:20:00',
        bairro: 'QNM 40',
        regiaoAdm: 'RA III - Taguatinga',
        cidade: 'Brasília - DF'
      },
      {
        id: 4,
        moderadorId: 3,
        moderadorNome: 'Carlos Santos',
        acao: 'criacao',
        descricao: 'Moderador criado por Guilherme Nobrega',
        data: '2024-12-01T14:20:00',
        bairro: 'Setor O',
        regiaoAdm: 'RA IX - Ceilândia',
        cidade: 'Brasília - DF'
      },
      {
        id: 5,
        moderadorId: 3,
        moderadorNome: 'Carlos Santos',
        acao: 'moderacao_campanha',
        descricao: 'Editou campanha "Cesta Básica para Idosos"',
        data: '2024-12-05T09:15:00',
        bairro: 'Setor P Norte',
        regiaoAdm: 'RA IX - Ceilândia',
        cidade: 'Brasília - DF'
      },
      {
        id: 6,
        moderadorId: 4,
        moderadorNome: 'Mariana Costa',
        acao: 'criacao',
        descricao: 'Moderador criado por Guilherme Nobrega',
        data: '2024-12-08T11:00:00',
        bairro: 'Quadra 1',
        regiaoAdm: 'RA XII - Samambaia',
        cidade: 'Brasília - DF'
      },
      {
        id: 7,
        moderadorId: 4,
        moderadorNome: 'Mariana Costa',
        acao: 'moderacao_campanha',
        descricao: 'Aprovou campanha "Natal Solidário"',
        data: '2024-12-10T16:45:00',
        bairro: 'Quadra 300',
        regiaoAdm: 'RA XII - Samambaia',
        cidade: 'Brasília - DF'
      },
      {
        id: 8,
        moderadorId: 5,
        moderadorNome: 'Pedro Lima',
        acao: 'criacao',
        descricao: 'Moderador criado por Guilherme Nobrega',
        data: '2024-12-12T08:30:00',
        bairro: 'Águas Claras Centro',
        regiaoAdm: 'RA XX - Águas Claras',
        cidade: 'Brasília - DF'
      },
      {
        id: 9,
        moderadorId: 2,
        moderadorNome: 'Ana Paula Silva',
        acao: 'desativacao',
        descricao: 'Conta desativada temporariamente',
        data: '2024-12-13T10:00:00',
        bairro: 'Centro',
        regiaoAdm: 'RA III - Taguatinga',
        cidade: 'Brasília - DF'
      },
      {
        id: 10,
        moderadorId: 6,
        moderadorNome: 'Fernanda Oliveira',
        acao: 'criacao',
        descricao: 'Moderador criado por Guilherme Nobrega',
        data: '2024-12-13T14:00:00',
        bairro: 'Setor Central',
        regiaoAdm: 'RA V - Sobradinho',
        cidade: 'Brasília - DF'
      }
    ];
    setHistorico(mockHistorico);
  };

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'criacao':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'edicao':
        return 'bg-blue-500/20 text-blue-400';
      case 'ativacao':
        return 'bg-green-500/20 text-green-400';
      case 'desativacao':
        return 'bg-amber-500/20 text-amber-400';
      case 'exclusao':
        return 'bg-red-500/20 text-red-400';
      case 'moderacao_campanha':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getAcaoLabel = (acao: string) => {
    switch (acao) {
      case 'criacao':
        return 'Criação';
      case 'edicao':
        return 'Edição';
      case 'ativacao':
        return 'Ativação';
      case 'desativacao':
        return 'Desativação';
      case 'exclusao':
        return 'Exclusão';
      case 'moderacao_campanha':
        return 'Moderação';
      default:
        return acao;
    }
  };

  const toggleGrupo = (grupo: string) => {
    const novosGrupos = new Set(gruposExpandidos);
    if (novosGrupos.has(grupo)) {
      novosGrupos.delete(grupo);
    } else {
      novosGrupos.add(grupo);
    }
    setGruposExpandidos(novosGrupos);
  };

  const agruparHistorico = () => {
    if (agrupamento === 'todos') {
      return { 'Todos os Registros': historico };
    }

    const grupos: { [key: string]: HistoricoModerador[] } = {};
    
    historico.forEach(item => {
      let chave = '';
      switch (agrupamento) {
        case 'bairro':
          chave = item.bairro;
          break;
        case 'regiaoAdm':
          chave = item.regiaoAdm;
          break;
        case 'cidade':
          chave = item.cidade;
          break;
      }
      
      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(item);
    });

    // Ordenar grupos alfabeticamente
    const gruposOrdenados: { [key: string]: HistoricoModerador[] } = {};
    Object.keys(grupos).sort().forEach(key => {
      gruposOrdenados[key] = grupos[key].sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );
    });

    return gruposOrdenados;
  };

  const getEstatisticasPorAgrupamento = () => {
    const stats: { [key: string]: { total: number; moderadores: Set<number> } } = {};
    
    historico.forEach(item => {
      let chave = '';
      switch (agrupamento) {
        case 'bairro':
          chave = item.bairro;
          break;
        case 'regiaoAdm':
          chave = item.regiaoAdm;
          break;
        case 'cidade':
          chave = item.cidade;
          break;
        default:
          chave = 'todos';
      }
      
      if (!stats[chave]) {
        stats[chave] = { total: 0, moderadores: new Set() };
      }
      stats[chave].total++;
      stats[chave].moderadores.add(item.moderadorId);
    });

    return stats;
  };

  const grupos = agruparHistorico();
  const estatisticas = getEstatisticasPorAgrupamento();

  if (!user || user.email !== 'guinb@soscomida.com') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/moderadores')}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para Moderadores
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <History className="text-purple-500" size={32} />
              <h1 className="text-3xl font-bold text-white">Histórico de Moderadores</h1>
            </div>
            <p className="text-slate-400">
              Visualize todas as ações dos moderadores agrupadas por localização
            </p>
          </div>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Total de Ações</div>
              <div className="text-2xl font-bold text-white">{historico.length}</div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800">
              <div className="text-purple-400 text-sm mb-1">Moderadores Ativos</div>
              <div className="text-2xl font-bold text-purple-500">
                {new Set(historico.map(h => h.moderadorId)).size}
              </div>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
              <div className="text-blue-400 text-sm mb-1">Regiões Adm.</div>
              <div className="text-2xl font-bold text-blue-500">
                {new Set(historico.map(h => h.regiaoAdm)).size}
              </div>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800">
              <div className="text-emerald-400 text-sm mb-1">Bairros</div>
              <div className="text-2xl font-bold text-emerald-500">
                {new Set(historico.map(h => h.bairro)).size}
              </div>
            </div>
          </div>

          {/* Filtros de Agrupamento */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-400 font-medium">Agrupar por:</span>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAgrupamento('todos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    agrupamento === 'todos'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Users size={18} />
                  Todos
                </button>

                <button
                  onClick={() => setAgrupamento('bairro')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    agrupamento === 'bairro'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <MapPin size={18} />
                  Bairro
                </button>

                <button
                  onClick={() => setAgrupamento('regiaoAdm')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    agrupamento === 'regiaoAdm'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Building2 size={18} />
                  Região Adm.
                </button>

                <button
                  onClick={() => setAgrupamento('cidade')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    agrupamento === 'cidade'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Map size={18} />
                  Cidade
                </button>
              </div>
            </div>
          </div>

          {/* Lista Agrupada */}
          <div className="space-y-4">
            {Object.entries(grupos).map(([grupo, itens]) => (
              <div
                key={grupo}
                className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
              >
                {/* Header do Grupo */}
                <button
                  onClick={() => toggleGrupo(grupo)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {gruposExpandidos.has(grupo) ? (
                      <ChevronDown size={20} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                    
                    {agrupamento === 'bairro' && <MapPin size={20} className="text-emerald-400" />}
                    {agrupamento === 'regiaoAdm' && <Building2 size={20} className="text-blue-400" />}
                    {agrupamento === 'cidade' && <Map size={20} className="text-purple-400" />}
                    {agrupamento === 'todos' && <Users size={20} className="text-slate-400" />}
                    
                    <span className="text-lg font-semibold text-white">{grupo}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {agrupamento !== 'todos' && estatisticas[grupo] && (
                      <>
                        <span className="text-sm text-slate-400">
                          {estatisticas[grupo].moderadores.size} moderador(es)
                        </span>
                        <span className="bg-slate-600 text-white text-sm px-3 py-1 rounded-full">
                          {itens.length} ações
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Lista de Itens */}
                {gruposExpandidos.has(grupo) && (
                  <div className="border-t border-slate-700">
                    {itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-white">{item.moderadorNome}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getAcaoColor(item.acao)}`}>
                              {getAcaoLabel(item.acao)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{item.descricao}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {item.bairro}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              {item.regiaoAdm}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-2 md:mt-0">
                          <Calendar size={14} />
                          {new Date(item.data).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(item.data).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumo por Região Administrativa */}
          {agrupamento === 'todos' && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Resumo por Região Administrativa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(historico.map(h => h.regiaoAdm))).sort().map(ra => {
                  const itensRA = historico.filter(h => h.regiaoAdm === ra);
                  const moderadoresRA = new Set(itensRA.map(h => h.moderadorId));
                  
                  return (
                    <div
                      key={ra}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={20} className="text-blue-400" />
                        <h3 className="font-semibold text-white text-sm">{ra}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-400">
                          <span>Moderadores:</span>
                          <span className="text-white font-medium">{moderadoresRA.size}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Total de ações:</span>
                          <span className="text-white font-medium">{itensRA.length}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Bairros:</span>
                          <span className="text-white font-medium">
                            {new Set(itensRA.map(h => h.bairro)).size}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
