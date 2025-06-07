"use client";

import { Home, User, ShoppingBasket, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import * as jose from "jose";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = getCookie("token");

      if (!token) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        return;
      }

      try {
        const secret = new TextEncoder().encode("c4r4d3b0n3");

        const { payload } = await jose.jwtVerify(token as string, secret);
        const roles = payload.roles as string[] | undefined;

        setIsLoggedIn(true);
        setIsAdmin(roles?.includes("admin") || false);
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <nav
      className="w-full -ml-2 md:-ml-[17px] sm:max-w-[calc(641px)] fixed top-0 z-10 px-4 md:px-6 py-3 shadow-xl border
    bg-foreground border-none text-white"
    >
      <div className="flex justify-between items-center gap-8">
        <Link href="/" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <Image
              src="https://caradebone.com/products/1704494621.png"
              alt="Logo"
              width={97}
              height={55}
              className="h-[40px] md:h-[50px] w-auto"
            />
          </div>
        </Link>
        <NavItem href="/" icon={<Home className="w-5 h-5" />} label="Início" />

        <NavItem
          href="/pedidos"
          icon={<ShoppingBasket className="w-5 h-5" />}
          label="Minhas cotas"
        />

        {isLoggedIn && isAdmin ? (
          <NavItem
            href="/admin"
            icon={<Settings className="w-5 h-5" />}
            label="Admin"
          />
        ) : (
          <NavItem
            href="/login"
            icon={<User className="w-5 h-5" />}
            label={isLoggedIn ? "Minha Conta" : "Entrar"}
          />
        )}
      </div>
    </nav>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link
      href={href}
      className="text-white hover:text-white/80 transition-colors duration-200 flex items-center gap-2"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
