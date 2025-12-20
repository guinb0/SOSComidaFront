'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Sidebar } from '@/components/Sidebar';
import { HandHeart, AlertCircle } from 'lucide-react';

export default function PedidosAjudaPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <HandHeart className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  Pedidos de Ajuda
                </h1>
                <p className="text-slate-400 mt-1">
                  Pessoas que precisam de ajuda imediata em sua região
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="text-center text-slate-400">
              <p className="text-lg mb-4">Em desenvolvimento</p>
              <p className="text-sm">Esta funcionalidade estará disponível em breve</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
