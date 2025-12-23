'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateCampanha } from '@/lib/hooks/use-campanhas';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Upload, X, Image as ImageIcon, MapPin } from 'lucide-react';

interface Regiao {
  id: number;
  nome: string;
  sigla: string;
  cidade: string;
  estado: string;
}

const campanhaSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  metaArrecadacao: z.number().positive('Meta deve ser positiva'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
});

type CampanhaFormData = z.infer<typeof campanhaSchema>;

export default function NovaCampanhaPage() {
  const router = useRouter();
  const createCampanha = useCreateCampanha();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagens, setImagens] = useState<string[]>([]);
  const [novaImagemUrl, setNovaImagemUrl] = useState('');
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<number | null>(null);

  useEffect(() => {
    carregarRegioes();
  }, []);

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
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampanhaFormData>({
    resolver: zodResolver(campanhaSchema),
  });

  const adicionarImagem = () => {
    if (novaImagemUrl && novaImagemUrl.startsWith('http')) {
      setImagens([...imagens, novaImagemUrl]);
      setNovaImagemUrl('');
    }
  };

  const removerImagem = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CampanhaFormData) => {
    try {
      setError(null);
      
      if (imagens.length === 0) {
        setError('Adicione pelo menos uma foto da campanha');
        return;
      }
      
      await createCampanha.mutateAsync({
        ...data,
        imagemUrl: imagens[0],
        imagens: imagens,
        regiaoId: regiaoSelecionada
      } as any);
      setSuccess(true);
      setTimeout(() => {
        router.push('/campanhas');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao criar campanha:', err);
      setError(err.response?.data?.message || 'Erro ao criar campanha. Tente novamente.');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Enviada!</h2>
            <p className="text-slate-600 mb-4">
              Sua campanha foi enviada para análise. Um moderador irá revisar e aprovar em breve.
            </p>
            <p className="text-sm text-slate-500">Redirecionando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Solicitar Nova Campanha</h1>
            <p className="text-slate-600 mb-8">Preencha os dados abaixo para criar uma campanha de arrecadação</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Título da Campanha
                </label>
                <input
                  {...register('titulo')}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900"
                  placeholder="Ex: Ajude a alimentar 100 famílias"
                />
                {errors.titulo && (
                  <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descrição
                </label>
                <textarea
                  {...register('descricao')}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900"
                  placeholder="Descreva os objetivos e detalhes da campanha..."
                />
                {errors.descricao && (
                  <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fotos da Campanha *
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Adicione fotos que mostrem a situação e ajudem a sensibilizar os doadores
                </p>
                
                {/* Imagens adicionadas */}
                {imagens.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {imagens.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x150?text=Erro';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removerImagem(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Adicionar nova imagem */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={novaImagemUrl}
                    onChange={(e) => setNovaImagemUrl(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <button
                    type="button"
                    onClick={adicionarImagem}
                    disabled={!novaImagemUrl || !novaImagemUrl.startsWith('http')}
                    className="px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Upload size={20} />
                    Adicionar
                  </button>
                </div>
                {imagens.length === 0 && (
                  <p className="text-amber-600 text-sm mt-2 flex items-center gap-1">
                    <ImageIcon size={16} />
                    Adicione pelo menos uma foto para a campanha
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Meta de Arrecadação (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('metaArrecadacao', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900"
                  placeholder="0.00"
                />
                {errors.metaArrecadacao && (
                  <p className="text-red-500 text-sm mt-1">{errors.metaArrecadacao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Região Administrativa
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Selecione a região onde a campanha será realizada
                </p>
                <select
                  value={regiaoSelecionada || ''}
                  onChange={(e) => setRegiaoSelecionada(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900 bg-white"
                >
                  <option value="">Selecione uma região (opcional)</option>
                  {regioes.map((regiao) => (
                    <option key={regiao.id} value={regiao.id}>
                      {regiao.nome} - {regiao.cidade}/{regiao.estado}
                    </option>
                  ))}
                </select>
                {regioes.length === 0 && (
                  <p className="text-amber-600 text-sm mt-2">
                    Nenhuma região cadastrada no sistema
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    {...register('dataInicio')}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900"
                  />
                  {errors.dataInicio && (
                    <p className="text-red-500 text-sm mt-1">{errors.dataInicio.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    {...register('dataFim')}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-slate-900"
                  />
                  {errors.dataFim && (
                    <p className="text-red-500 text-sm mt-1">{errors.dataFim.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Nota:</strong> Sua campanha será analisada por um moderador antes de ficar visível para outros usuários.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={createCampanha.isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {createCampanha.isPending ? 'Enviando...' : 'Solicitar Campanha'}
                </button>
                <Link
                  href="/campanhas"
                  className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
