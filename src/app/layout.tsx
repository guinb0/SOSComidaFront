import React from 'react';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import './globals.css';

export const metadata = {
  title: 'SOS Comida',
  description: 'Plataforma de doações e campanhas solidárias',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
