import { Trophy, User } from "lucide-react";
import { getWinners } from "../contexts/user/user.actions";
import Image from "next/image";
import { ImageCarousel } from "./ImageCarousel";
import { formatDate } from "../utils/data";

const Winners = async () => {
  const winners = await getWinners();
  console.log(winners);

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        <h1 className="text-xl md:text-2xl font-bold">Ganhadores</h1>
      </div>
      <div className="flex flex-col gap-4">
        {winners.map((winner) => (
          <div
            key={winner.serialNumber}
            className="flex items-center justify-between gap-2 bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg text-white p-2 rounded-xl"
          >
            <div className={`flex items-center ${winner.userImageUrl ? "p-0" : "p-2"} gap-2 justify-center border-2 border-red-500 min-w-[50px] min-h-[50px] md:min-w-[70px] md:min-h-[70px] md:max-w-[70px] md:max-h-[70px] object-cover rounded-md overflow-hidden`}>

            {winner.userImageUrl && (
              <Image
                src={winner.userImageUrl}
                alt={winner.userName}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            )}
            {!winner.userImageUrl && <User className="w-full h-full text-gray-300" />}
            </div>
            <div className="flex flex-col w-full md:w-auto items-center">
              <p className="font-bold md:text-lg truncate">{winner.userName}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm">Número da sorte:</span>
                <p className="text-xs md:text-sm font-bold">{winner.serialNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm">Data do sorteio:</span>
                <p className="text-xs md:text-sm font-bold">{formatDate(winner.updatedAt)}</p>
              </div>
            </div>
            <div className="flex flex-col max-h-[50px] max-w-[50px] min-h-[50px] min-w-[50px] md:min-h-[70px] md:min-w-[70px] md:max-h-[70px] md:max-w-[70px] border-2 rounded-md overflow-hidden border-red-500">
              <ImageCarousel
                images={winner.raffleImagesUrls}
                title={winner.raffleTitle}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Winners;
