import Link from "next/link";
import { getRaffles } from "./contexts/raffle/raffle.actions";
import Image from "next/image";

export default async function Home() {
  const raffles = await getRaffles();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl md:text-2xl font-bold">Prêmios</h1>
      {raffles.map((raffle) => (
        <div
          key={raffle.id}
          className="flex flex-col gap-2 p-3 md:p-4 rounded-xl bg-white backdrop-blur-sm border border-white shadow-lg text-foreground"
        >
          <div className="flex justify-center">
            {raffle.imagesUrls[0] && (
              <Image
                src={raffle.imagesUrls[0]}
                alt={raffle.title}
                width={640}
                height={360}
                className="rounded-sm w-full max-h-[180px] md:max-h-[250px] object-cover"
              />
            )}
          </div>
          <h2 className="text-lg font-bold">{raffle.title}</h2>
          <p className="text-sm opacity-80 line-clamp-1 md:line-clamp-none">
            {raffle.description}
          </p>

          <div className="flex justify-center">
            <Link href={`/sorteio/${raffle.id}`}>
              <button className="animate-pulse text-sm md:text-base cursor-pointer border font-bold hover:border-foreground border-foreground/90 mt-2 px-6 py-2 bg-foreground/95 hover:bg-foreground/90 text-white rounded-lg transition-colors duration-300">
                Compre já!
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
