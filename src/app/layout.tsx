import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'SOS Comida',
  description: 'Plataforma de doações e campanhas solidárias',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
