'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
    }
  }, [theme, mounted]);

  // Prevenir flash de tema incorreto
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
