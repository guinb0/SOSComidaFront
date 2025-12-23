'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, HelpCircle, User, History, LogOut, Menu, X, Shield, Users, ChevronRight, Bell, Award, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: '/inicio', label: 'Início', icon: Home },
    { href: '/campanhas', label: 'Campanhas', icon: Heart },
    { href: '/pedidos-ajuda', label: 'Pedidos de Ajuda', icon: HelpCircle },
    { href: '/notificacoes', label: 'Notificações', icon: Bell },
    { href: '/historico-doacoes', label: 'Doações', icon: History },
    { href: '/historico-voluntariado', label: 'Voluntariado', icon: Award },
    { href: '/perfil', label: 'Meu Perfil', icon: User },
  ];

  // Menu exclusivo para admin e moderadores
  const isAdmin = user?.tipo === 'admin';
  const isModerador = user?.tipo === 'moderador' || isAdmin;
  const adminMenuItems = isModerador
    ? [
        { href: '/moderacao', label: 'Moderação', icon: Shield },
        { href: '/aprovacao-instituicoes', label: 'Instituições', icon: Building2 },
        ...(isAdmin ? [{ href: '/moderadores', label: 'Moderadores', icon: Users }] : [])
      ]
    : [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl text-slate-700 shadow-lg"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-72 theme-bg-tertiary backdrop-blur-xl border-r theme-border flex flex-col z-40 transition-all duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo/Header */}
        <div className="p-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl blur-lg opacity-50" />
              <Image
                src="/logo.png"
                alt="SOS Comida"
                width={44}
                height={44}
                className="rounded-xl relative z-10"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">SOS Comida</h1>
              <p className="text-xs theme-text-muted">Plataforma de Doações</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-4 mt-6 mb-2">
            <div className="glass-card p-4 flex items-center gap-3">
              {user.fotoUrl ? (
                <img 
                  src={`http://localhost:5118${user.fotoUrl}`}
                  alt={user.nome}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="avatar text-sm">
                  {user.nome?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="theme-text-primary font-medium truncate text-sm">{user.nome}</p>
                <p className="theme-text-muted text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider px-3 mb-3">
            Menu Principal
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 theme-text-primary' 
                    : 'theme-text-secondary hover:theme-text-primary hover:bg-black/5'
                  }
                `}
              >
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  ${isActive 
                    ? 'bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/20' 
                    : 'bg-black/5 group-hover:bg-black/10'
                  }
                `}>
                  <Icon size={18} className={isActive ? 'text-white' : ''} />
                </div>
                <span className="font-medium text-sm flex-1">{item.label}</span>
                {isActive && <ChevronRight size={16} className="theme-text-muted" />}
              </Link>
            );
          })}

          {/* Admin Menu */}
          {adminMenuItems.length > 0 && (
            <>
              <div className="divider my-4" />
              <div className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider px-3 mb-3">
                Administração
              </div>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-amber-500/10 to-red-500/10 theme-text-primary' 
                        : 'theme-text-secondary hover:theme-text-primary hover:bg-black/5'
                      }
                    `}
                  >
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center transition-all
                      ${isActive 
                        ? 'bg-gradient-to-br from-amber-500 to-red-500 shadow-lg shadow-amber-500/20' 
                        : 'bg-black/5 group-hover:bg-black/10'
                      }
                    `}>
                      <Icon size={18} className={isActive ? 'text-white' : ''} />
                    </div>
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="theme-text-muted" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t theme-border space-y-2">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl theme-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            <span className="font-medium text-sm">Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}
