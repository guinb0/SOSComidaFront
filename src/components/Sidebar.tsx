'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Heart, HelpCircle, User, History, LogOut, Menu, X, Shield, Sun, Moon, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      href: '/inicio', 
      label: 'Início', 
      icon: Home 
    },
    { 
      href: '/campanhas', 
      label: 'Campanhas', 
      icon: Heart 
    },
    { 
      href: '/pedidos-ajuda', 
      label: 'Pedidos de Ajuda', 
      icon: HelpCircle 
    },
    { 
      href: '/historico-doacoes', 
      label: 'Histórico de Doações', 
      icon: History 
    },
    { 
      href: '/perfil', 
      label: 'Perfil', 
      icon: User 
    },
  ];

  // Menu exclusivo para admin e moderadores
  const isAdmin = user?.tipo === 'admin';
  const isModerador = user?.tipo === 'moderador' || isAdmin;
  const adminMenuItems = isModerador
    ? [
        { href: '/moderacao', label: 'Moderação', icon: Shield },
        ...(isAdmin ? [{ href: '/moderadores', label: 'Gerenciar Moderadores', icon: Users }] : [])
      ]
    : [];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 sidebar-bg border-r theme-border flex flex-col z-40 transition-all duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Logo/Header */}
      <div className="p-4 border-b theme-border">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="SOS Comida"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              SOS Comida
            </h1>
            {user && (
              <p className="text-xs theme-text-secondary truncate max-w-[140px]">{user.nome}</p>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Admin */}
        {adminMenuItems.length > 0 && (
          <>
            <div className="pt-4 pb-2 px-4">
              <div className="text-xs font-semibold text-slate-500 uppercase">
                Administração
              </div>
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
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all border
                    ${isActive 
                      ? 'bg-red-600 text-white border-red-500' 
                      : 'text-red-400 hover:bg-red-900/20 border-red-800/50 hover:border-red-700'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Theme Toggle & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* Toggle de Tema */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-all"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="font-medium">
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${
            theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-600'
          } relative`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              theme === 'dark' ? 'left-0.5' : 'left-6'
            }`} />
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
}
