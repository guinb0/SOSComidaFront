import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código não fornecido' }, { status: 400 });
    }

    // Trocar o código por access token
    const tokenResponse = await fetch('https://sso.acesso.gov.br/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_GOVBR_REDIRECT_URI || '',
        client_id: process.env.GOVBR_CLIENT_ID || '',
        client_secret: process.env.GOVBR_CLIENT_SECRET || '',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Falha ao obter token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Obter informações do usuário
    const userResponse = await fetch('https://sso.acesso.gov.br/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Falha ao obter dados do usuário');
    }

    const userData = await userResponse.json();

    // Retornar os dados do usuário
    return NextResponse.json({
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phone_number,
      cpf: userData.sub, // CPF geralmente vem no campo 'sub'
    });

  } catch (error) {
    console.error('Erro no callback gov.br:', error);
    return NextResponse.json(
      { error: 'Erro ao processar autenticação' },
      { status: 500 }
    );
  }
}
