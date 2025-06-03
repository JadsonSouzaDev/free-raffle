import Link from "next/link";
import { getRaffles } from "./contexts/raffle/raffle.actions";
import Image from "next/image";
import { Gift } from "lucide-react";

const statuses = {
  active: "Compre já!",
  finished: "Sorteio finalizado",
};

const statusColors = {
  active: "bg-green-700",
  finished: "bg-red-700",
};

export default async function Home() {
  const rawRaffles = await getRaffles();
  const raffles = [...rawRaffles, ...rawRaffles, ...rawRaffles];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5" />
        <h1 className="text-xl md:text-2xl font-bold">Prêmios</h1>
      </div>
      {raffles.map((raffle, index) => {
        if (index === 0) {
          return (
            <Link key={`${raffle.id}-${index}`} href={`/sorteio/${raffle.id}`}>
              <div className="flex flex-col gap-2 p-3 md:p-4 rounded-xl bg-white backdrop-blur-sm border border-white shadow-lg text-foreground">
                <div className="flex flex-col justify-center">
                  <div className="relative w-full h-[230px] md:h-[320px]">
                    {raffle.imagesUrls[0] && (
                      <Image
                        src={raffle.imagesUrls[0]}
                        alt={raffle.title}
                        fill
                        priority
                        className="rounded-sm object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r  from-foreground to-foreground/60 text-white py-2 px-2">
                      <h1 className="text-xl md:text-2xl font-bold">
                        {raffle.title}
                      </h1>
                    </div>
                  </div>
                </div>
                <p className="text-sm opacity-80 line-clamp-1 md:line-clamp-none">
                  {raffle.description}
                </p>

                <div className="flex justify-center">
                  <button className={`animate-pulse text-sm md:text-base cursor-pointer border font-bold mt-2 px-6 py-2 ${statusColors[raffle.status]} text-white rounded-lg transition-colors duration-300`}>
                    {statuses[raffle.status]}
                  </button>
                </div>
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={`${raffle.id}-${index}`}
            href={`/sorteio/${raffle.id}`}
            className="flex flex-row items-center gap-3 p-2 rounded-lg bg-white backdrop-blur-sm border border-white shadow-md text-foreground hover:bg-gray-50 transition-colors duration-200"
          >
            {raffle.imagesUrls[0] && (
              <Image
                src={raffle.imagesUrls[0]}
                alt={raffle.title}
                width={80}
                height={80}
                className="rounded-md object-cover w-25 h-25"
              />
            )}
            <div className="flex flex-col flex-1 gap-1">
              <h2 className="text-base font-semibold line-clamp-1">
                {raffle.title}
              </h2>
              <p className="text-sm opacity-80 line-clamp-1">
                {raffle.description}
              </p>
              <div className="flex flex-row gap-2">
                <span
                  className={`${
                    statusColors[raffle.status]
                  } text-white text-sm px-2 py-1 rounded-md font-bold`}
                >
                  {statuses[raffle.status]}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
