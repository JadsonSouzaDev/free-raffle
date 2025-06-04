import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret"
);

// Essa função vai verificar se o token é válido
async function isValidToken(token: string): Promise<boolean> {
  try {
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error("error:", error);
    return false;
  }
}

// Essa função vai verificar se o usuário tem permissão de admin
async function hasAdminRole(token: string): Promise<boolean> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    const roles = payload.roles as string[] | undefined;
    return roles?.includes("admin") || false;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Verifica se a rota começa com /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Pega o token dos cookies
    const token = request.cookies.get("token")?.value;

    // Se não tiver token, redireciona para o login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await isValidToken(token);

    // Verifica se o token é válido
    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = await hasAdminRole(token);

    // Verifica se o usuário tem role de admin
    if (!isAdmin) {
      // Se não tiver permissão, redireciona para a home
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

// Configura em quais paths o middleware será executado
export const config = {
  matcher: "/admin/:path*",
};
