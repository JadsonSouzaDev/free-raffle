import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 text-foreground">
      <div className="text-center flex flex-col items-center justify-center gap-2">
        <h1 className="text-9xl font-bold opacity-20">404</h1>
        <h2 className="text-4xl font-semibold ">
          Página não encontrada
        </h2>
        <p className="opacity-70">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 mt-4 text-white bg-foreground rounded-lg hover:bg-foreground/90 transition-colors duration-200"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
