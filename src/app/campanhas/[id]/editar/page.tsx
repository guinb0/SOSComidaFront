'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useCampanha, useUpdateCampanha } from '@/lib/hooks/use-campanhas';
import Link from 'next/link';
import { useEffect } from 'react';

const campanhaSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  imagemUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  metaArrecadacao: z.number().positive('Meta deve ser positiva'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  status: z.enum(['ativa', 'pausada', 'finalizada']),
});

type CampanhaFormData = z.infer<typeof campanhaSchema>;

export default function EditarCampanhaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: campanha, isLoading } = useCampanha(Number(id));
  const updateCampanha = useUpdateCampanha();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampanhaFormData>({
    resolver: zodResolver(campanhaSchema),
  });

  useEffect(() => {
    if (campanha) {
      reset({
        titulo: campanha.titulo,
        descricao: campanha.descricao,
        imagemUrl: campanha.imagemUrl || '',
        metaArrecadacao: campanha.metaArrecadacao,
        dataInicio: campanha.dataInicio.split('T')[0],
        dataFim: campanha.dataFim.split('T')[0],
        status: campanha.status,
      });
    }
  }, [campanha, reset]);

  const onSubmit = async (data: CampanhaFormData) => {
    try {
      await updateCampanha.mutateAsync({ id: Number(id), data });
      router.push('/campanhas');
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Campanha não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Campanha</h1>
          <p className="text-gray-600 mb-8">Atualize as informações da campanha</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título da Campanha
              </label>
              <input
                {...register('titulo')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Ex: Ajude a alimentar 100 famílias"
              />
              {errors.titulo && (
                <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                {...register('descricao')}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Descreva os objetivos e detalhes da campanha..."
              />
              {errors.descricao && (
                <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL da Imagem (opcional)
              </label>
              <input
                {...register('imagemUrl')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {errors.imagemUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.imagemUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta de Arrecadação (R$)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('metaArrecadacao', { valueAsNumber: true })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="0.00"
              />
              {errors.metaArrecadacao && (
                <p className="text-red-500 text-sm mt-1">{errors.metaArrecadacao.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  {...register('dataInicio')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                {errors.dataInicio && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataInicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Término
                </label>
                <input
                  type="date"
                  {...register('dataFim')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
                {errors.dataFim && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataFim.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="ativa">Ativa</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateCampanha.isPending}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {updateCampanha.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <Link
                href="/campanhas"
                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
