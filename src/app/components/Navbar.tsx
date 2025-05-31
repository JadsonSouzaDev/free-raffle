import { Home, User, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="w-full -ml-2 sm:ml-2 md:-ml-0 sm:max-w-[calc(640px-2rem)] fixed bottom-4 lg:top-4 lg:bottom-auto px-4 md:px-6 py-3 rounded-2xl shadow-lg backdrop-blur-lg border
    bg-white/30 md:bg-foreground border-none  md:border-white ">
      <div className="flex justify-between items-center gap-8">
        <div className="flex flex-col items-center">
          <Image src="https://caradebone.com/products/1704494621.png" alt="Logo" width={97} height={55} className="h-[40px] md:h-[50px] w-auto" />
        </div>
        <NavItem href="/" icon={<Home size={24} />} label="Início" />
        <NavItem href="/orders" icon={<ShoppingBasket size={24} />} label="Minhas cotas" />
        <NavItem href="/profile" icon={<User size={24} />} label="Entrar" />
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
      className="text-foreground md:text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2"
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
