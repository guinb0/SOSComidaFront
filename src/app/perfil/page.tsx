'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';

export default function PerfilPage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    endereco: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cidade: user.cidade || '',
        endereco: user.endereco || '',
      });
    }
  }, [isAuthenticated, router, user]);

  const handleSave = () => {
    // Atualizar usuário no store
    if (user) {
      setUser({
        ...user,
        ...formData,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cidade: user.cidade || '',
        endereco: user.endereco || '',
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <User className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Meu Perfil
                </h1>
                <p className="text-slate-400 mt-1">
                  Gerencie suas informações pessoais
                </p>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                <Edit2 size={20} />
                Editar Perfil
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all"
                >
                  <Save size={20} />
                  Salvar
                </button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-b border-slate-700/50 p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{user.nome}</h2>
                  <p className="text-slate-400 capitalize">{user.tipo}</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8 space-y-6">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <User size={18} />
                  Nome Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-white text-lg px-4 py-3 bg-slate-800/50 rounded-lg">
                    {user.nome}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <Mail size={18} />
                  E-mail
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-white text-lg px-4 py-3 bg-slate-800/50 rounded-lg">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <Phone size={18} />
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-white text-lg px-4 py-3 bg-slate-800/50 rounded-lg">
                    {user.telefone || 'Não informado'}
                  </p>
                )}
              </div>

              {/* Cidade */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <MapPin size={18} />
                  Cidade
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-white text-lg px-4 py-3 bg-slate-800/50 rounded-lg">
                    {user.cidade || 'Não informado'}
                  </p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <MapPin size={18} />
                  Endereço
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-white text-lg px-4 py-3 bg-slate-800/50 rounded-lg">
                    {user.endereco || 'Não informado'}
                  </p>
                )}
              </div>

              {/* Informações da Conta */}
              <div className="pt-6 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Informações da Conta</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Tipo de Conta</p>
                    <p className="text-white font-semibold capitalize">{user.tipo}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">ID do Usuário</p>
                    <p className="text-white font-semibold">#{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </main>
    </div>
  );
}
