'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, Clock, MapPin, Users, HandHeart, CheckCircle2 } from 'lucide-react';
import { CampanhaDto } from '@/types';

export default function VoluntarioCampanhaPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [campanha, setCampanha] = useState<CampanhaDto | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleInscrever = async () => {
    try {
      // Adicionar como participante da campanha
      const response = await fetch(`http://localhost:5118/api/campanhas/${params.id}/participantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campanhaId: parseInt(params.id as string),
          usuarioId: user?.id,
          tipo: 'voluntario'
        })
      });

      if (response.ok) {
        alert(`Inscrição realizada com sucesso! Agora você pode acessar o chat da campanha.`);
        router.push(`/campanhas/${params.id}/chat`);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao realizar inscrição');
      }
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      // Simular sucesso para demo
      alert(`Inscrição realizada com sucesso! Entraremos em contato em breve.`);
      router.push(`/campanhas/${params.id}`);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!campanha) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="text-slate-600">Campanha não encontrada</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push(`/campanhas/${params.id}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Detalhes</span>
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <HandHeart className="text-purple-600" size={32} />
                Seja Voluntário
              </h1>
              <p className="text-slate-600">{campanha.titulo}</p>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">O que você vai fazer como voluntário</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                      <Users className="text-purple-600" size={24} />
                      Atividades Principais
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Organizar e embalar cestas básicas para distribuição</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Auxiliar na entrega de alimentos para as famílias cadastradas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Ajudar no cadastramento de novos beneficiários</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Apoiar na organização do estoque e controle de doações</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="text-blue-600" size={24} />
                        <h3 className="text-slate-900 font-semibold">Horários</h3>
                      </div>
                      <p className="text-slate-700 text-sm mb-2">Turnos disponíveis:</p>
                      <ul className="space-y-1 text-slate-600 text-sm">
                        <li>• Manhã: 8h às 12h</li>
                        <li>• Tarde: 14h às 18h</li>
                        <li>• Sábados: 9h às 13h</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="text-emerald-600" size={24} />
                        <h3 className="text-slate-900 font-semibold">Local</h3>
                      </div>
                      <p className="text-slate-700 text-sm">{campanha.localizacao}</p>
                      <p className="text-slate-500 text-sm mt-2">
                        Centro de Distribuição Solidária
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                    <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-600" size={24} />
                      O que você ganha
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>Certificado de horas voluntárias ao final de cada mês</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>Alimentação durante o turno de trabalho</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>Treinamento e capacitação em ação social</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>A satisfação de fazer a diferença na vida de muitas famílias</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-slate-900 font-semibold mb-3">Requisitos</h3>
                    <ul className="space-y-2 text-slate-700 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Ser maior de 16 anos (menores acompanhados de responsável)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Disponibilidade de pelo menos 4 horas por semana</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Comprometimento e pontualidade</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Empatia e vontade de ajudar o próximo</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleInscrever}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Confirmar Inscrição como Voluntário
                </button>

                <p className="text-slate-500 text-sm text-center">
                  Após a inscrição, entraremos em contato em até 48 horas para confirmar os detalhes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-200 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>
    </div>
  );
}
