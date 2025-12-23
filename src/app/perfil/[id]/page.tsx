'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { User, Mail, Phone, MapPin, Calendar, ArrowLeft, Shield } from 'lucide-react';

interface UsuarioPerfil {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  endereco: string;
  tipo: string;
  dataCriacao: string;
}

export default function PerfilUsuarioPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  const isModerador = user?.tipo === 'admin' || user?.tipo === 'moderador';
  const usuarioId = parseInt(params.id as string);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Se não for moderador e está tentando ver perfil de outro, redirecionar
    if (!isModerador && user?.id !== usuarioId) {
      router.push('/perfil');
      return;
    }

    const carregarUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:5118/api/usuarios/${usuarioId}`);
        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
        } else {
          console.error('Usuário não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarUsuario();
  }, [isAuthenticated, router, usuarioId, isModerador, user?.id]);

  if (!isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">Carregando...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors mb-6 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Voltar</span>
            </button>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
              <User className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">Usuário não encontrado</p>
            </div>
          </div>
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
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar</span>
          </button>

          {/* Aviso de modo moderador */}
          {isModerador && user?.id !== usuarioId && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Shield className="text-amber-600" size={24} />
              <div>
                <p className="font-semibold text-amber-800">Modo Moderador</p>
                <p className="text-amber-700 text-sm">Você está visualizando o perfil de outro usuário</p>
              </div>
            </div>
          )}

          {/* Card do Perfil */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Header com Avatar */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                  {usuario.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{usuario.nome}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      usuario.tipo === 'admin' 
                        ? 'bg-red-500/20 text-red-100 border border-red-300/30'
                        : usuario.tipo === 'moderador'
                        ? 'bg-amber-500/20 text-amber-100 border border-amber-300/30'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}>
                      {usuario.tipo === 'admin' ? 'Administrador' : 
                       usuario.tipo === 'moderador' ? 'Moderador' : 'Usuário'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Informações de Contato</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Mail className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">E-mail</p>
                    <p className="font-medium text-slate-900">{usuario.email || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Phone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Telefone</p>
                    <p className="font-medium text-slate-900">{usuario.telefone || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <MapPin className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Cidade</p>
                    <p className="font-medium text-slate-900">{usuario.cidade || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-3 bg-pink-100 rounded-lg">
                    <Calendar className="text-pink-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Membro desde</p>
                    <p className="font-medium text-slate-900">
                      {usuario.dataCriacao 
                        ? new Date(usuario.dataCriacao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              {usuario.endereco && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Endereço Completo</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-700">{usuario.endereco}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
