import { getRaffle } from "@/app/contexts/raffle/raffle.actions";
import { formatCurrency } from "@/app/utils/currency";
import Image from "next/image";
import QuantitySelector from "../_components/quantity-selector";
import TopBuyers from "../_components/top-buyers";
import AwardQuotes from "../_components/award-quotes";
import { Gift } from "lucide-react";

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
      <h1 className="text-xl md:text-2xl font-bold text-center">
        {raffle.title}
      </h1>
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
              priority
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

        <TopBuyers />

        <AwardQuotes />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <h2 className="text-lg font-bold">Promoção</h2>
          </div>
          <div className="flex flex-row gap-2">
            {raffle.prices.slice(1).map((price) => (
              <div
                key={price.id}
                className="bg-green-700 py-1 px-3 rounded-lg text-sm w-fit text-white"
              >
                <span className="">{price.quantity} cotas por </span>
                <span className="font-bold">
                  {formatCurrency(price.price * price.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuantitySelector
        raffle={{
          id: raffle.id,
          title: raffle.title,
          prices: raffle.prices.map((price) => ({
            id: price.id,
            price: price.price,
            quantity: price.quantity,
          })),
        }}
      />
    </div>
  );
}

export default SorteioPage;
