'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Trash2, Loader2 } from 'lucide-react';

export default function PerfilPage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
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

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploadingFoto(true);
      const formData = new FormData();
      formData.append('foto', file);

      const response = await fetch(`http://localhost:5118/auth/perfil/${user.id}/foto`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          ...user,
          fotoUrl: data.fotoUrl
        });
        alert('Foto atualizada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao atualizar foto');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar foto');
    } finally {
      setUploadingFoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoverFoto = async () => {
    if (!user) return;
    if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

    try {
      setUploadingFoto(true);
      const response = await fetch(`http://localhost:5118/auth/perfil/${user.id}/foto`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUser({
          ...user,
          fotoUrl: undefined
        });
        alert('Foto removida com sucesso!');
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao remover foto');
      }
    } catch (error) {
      alert('Erro ao remover foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <main className="flex-1 md:ml-72">
        {/* Header com foto de capa */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-teal-400 to-cyan-500" />
          
          {/* Avatar */}
          <div className="absolute left-8 -bottom-12">
            <div className="relative">
              {user.fotoUrl ? (
                <img 
                  src={`http://localhost:5118${user.fotoUrl}`}
                  alt={user.nome}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-semibold border-4 border-white shadow-md">
                  {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFoto}
                className="absolute bottom-0 right-0 p-2 bg-teal-500 hover:bg-teal-600 rounded-full text-white shadow-md transition-colors"
              >
                {uploadingFoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleUploadFoto}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Botões do header */}
          <div className="absolute right-6 bottom-4 flex gap-2">
            {user.fotoUrl && (
              <button
                onClick={handleRemoverFoto}
                disabled={uploadingFoto}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remover foto
              </button>
            )}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
              >
                Editar perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Conteúdo */}
        <div className="pt-16 px-8 pb-8 max-w-3xl">
          
          {/* Nome e tipo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{user.nome}</h1>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full capitalize">
              {user.tipo}
            </span>
          </div>
          
          {/* Seções */}
          <div className="space-y-8">
            
            {/* Informações básicas */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Informações básicas
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Nome</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="text-right bg-transparent border-b border-teal-500 text-gray-900 focus:outline-none px-2 py-1"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{user.nome}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">E-mail</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-right bg-transparent border-b border-teal-500 text-gray-900 focus:outline-none px-2 py-1"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{user.email}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Telefone</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="Adicionar"
                      className="text-right bg-transparent border-b border-teal-500 text-gray-900 focus:outline-none px-2 py-1 placeholder-gray-400"
                    />
                  ) : (
                    <span className={user.telefone ? "text-gray-900 font-medium" : "text-gray-400"}>
                      {user.telefone || "Adicionar"}
                    </span>
                  )}
                </div>
              </div>
            </section>
            
            {/* Endereço */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Endereço
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Cidade</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="Adicionar"
                      className="text-right bg-transparent border-b border-teal-500 text-gray-900 focus:outline-none px-2 py-1 placeholder-gray-400"
                    />
                  ) : (
                    <span className={user.cidade ? "text-gray-900 font-medium" : "text-gray-400"}>
                      {user.cidade || "Adicionar"}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Endereço</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      placeholder="Adicionar"
                      className="text-right bg-transparent border-b border-teal-500 text-gray-900 focus:outline-none px-2 py-1 placeholder-gray-400"
                    />
                  ) : (
                    <span className={user.endereco ? "text-gray-900 font-medium" : "text-gray-400"}>
                      {user.endereco || "Adicionar"}
                    </span>
                  )}
                </div>
              </div>
            </section>
            
            {/* Conta */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Conta
              </h2>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Edit2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Alterar senha</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
                
                <button className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Histórico de atividades</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            </section>
            
          </div>
        </div>
      </main>
    </div>
  );
}
