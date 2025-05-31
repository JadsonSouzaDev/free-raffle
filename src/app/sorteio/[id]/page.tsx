import { Raffle } from "@/app/contexts/raffle/entities/raffle.entity";
import { getRaffle } from "@/app/contexts/raffle/raffle.actions";
import { formatCurrency } from "@/app/utils/currency";
import Image from "next/image";

interface SorteioPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function SorteioPage({ params }: SorteioPageProps) {
  const { id } = await params;
  const raffle = await getRaffle(id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl md:text-2xl font-bold">{raffle.title}</h1>
      <div
        key={raffle.id}
        className="flex flex-col gap-4 p-3 md:p-4 rounded-xl bg-white backdrop-blur-sm border border-white shadow-lg text-foreground"
      >
        <div className="flex justify-center">
          {raffle.imagesUrls[0] && (
            <Image
              src={raffle.imagesUrls[0]}
              alt={raffle.title}
              width={640}
              height={360}
              className="rounded-sm w-full max-h-[200px] md:max-h-[280px] object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-sm md:text-base">
            Cotas a partir de{" "}
            <span className="font-bold bg-foreground/95 text-white px-2 py-1 rounded-md">
              {formatCurrency(raffle.prices[0].price)}
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Promoção</h2>
          <div className="flex flex-row gap-2">
            {raffle.prices.slice(1).map((price) => (
              <div
                key={price.id}
                className="bg-green-700 py-1 px-3 rounded-lg text-sm w-fit text-white"
              >
                <span className="">{price.quantity} cotas por </span>
                <span className="font-bold">{formatCurrency(price.price * price.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {[
            ...new Set([
              25,
              50,
              100,
              200,
              300,
              Math.max(...raffle.prices.map((p) => p.quantity)),
            ]),
          ]
            .sort((a, b) => a - b)
            .map((value) => (
              <QuantityButton key={value} value={value} raffle={raffle} />
            ))}
        </div>
        <div className="md:grid md:grid-cols-4 gap-2 hidden ">
          {[
            ...new Set([
              10,
              25,
              50,
              100,
              200,
              300,
              400,
              Math.max(...raffle.prices.map((p) => p.quantity)),
            ]),
          ]
            .sort((a, b) => a - b)
            .map((value) => (
              <QuantityButton key={value} value={value} raffle={raffle} />
            ))}
        </div>
      </div>
    </div>
  );
}

const QuantityButton = ({
  value,
  raffle,
}: {
  value: number;
  raffle: Raffle;
}) => {
  const isMostPopular =
    value === Math.max(...raffle.prices.map((p) => p.quantity));
  return (
    <button
      key={value}
      className={`cursor-pointer ${
        isMostPopular
          ? "bg-green-700 border-green-800 border-2"
          : "bg-foreground border-foreground border-2"
      } text-white px-3 ${
        isMostPopular ? "py-6" : "py-6"
      } rounded-lg transition-colors duration-300 flex flex-col items-center justify-between relative`}
    >
      {isMostPopular && (
        <span className=" bg-green-800 absolute -mt-6 text-xs font-bold px-2 py-1 md:rounded-b-sm">
          MAIS POPULAR
        </span>
      )}
      <div className="flex flex-col items-center justify-center">
        <span className="font-bold text-2xl md:text-3xl">+ {value}</span>
        <span className="text-xs md:text-sm">SELECIONAR</span>
      </div>
    </button>
  );
};

export default SorteioPage;
