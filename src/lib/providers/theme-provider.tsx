'use client';

import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sempre usar tema claro
    document.documentElement.classList.add('light-theme');
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
