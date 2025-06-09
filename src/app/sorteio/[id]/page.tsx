import {
  getRaffle,
  getRaffleWinner,
} from "@/app/contexts/raffle/raffle.actions";
import { formatCurrency } from "@/app/utils/currency";
import QuantitySelector from "../_components/quantity-selector";
import TopBuyers from "../_components/top-buyers";
import AwardQuotes from "../_components/award-quotes";
import { Gift, Info } from "lucide-react";
import {
  getEndOfDay,
  getEndOfWeek,
  getStartOfDay,
  getStartOfWeek,
} from "@/app/utils/date";
import { ImageCarousel } from "@/app/components/ImageCarousel";
import WhatsappSuport from "@/app/components/WhatsappSuport";

interface SorteioPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function SorteioPage({ params }: SorteioPageProps) {
  const { id } = await params;
  const raffle = await getRaffle(id);
  const winner = raffle.winnerQuotaId ? await getRaffleWinner(raffle.id) : null;
  const flags = raffle.flags;

  const topBuyersWeekSubtitle = `(${new Date(
    getStartOfWeek()
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} a ${new Date(getEndOfWeek()).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}) `;
  const topBuyersDaySubtitle = `(${new Date(getStartOfDay()).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  )} a ${new Date(getEndOfDay()).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })})`;

  return (
    <div className="flex flex-col gap-6 text-white">
      <div
        key={raffle.id}
        className="flex flex-col gap-4 py-3 md:p-4 text-white"
      >
        <div className="flex flex-col justify-center">
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
            <ImageCarousel images={raffle.imagesUrls} title={raffle.title} />
            <div className="relative -mt-12 bg-gradient-to-r from-foreground to-foreground/60 text-white py-2 px-2">
              <h1 className="text-xl md:text-2xl font-bold">{raffle.title}</h1>
            </div>
          </div>
        </div>
        {raffle.status === "active" && (
          <>
            <div className="flex flex-col gap-2 items-center">
              <h2 className="text-sm md:text-base">
                Cotas a partir de{" "}
                <span className="font-bold bg-foreground/95 text-white px-2 py-1 rounded-md">
                  {formatCurrency(raffle.prices[0].price)}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <h2 className="text-lg font-bold">Promoção</h2>
              </div>
              <div className="flex flex-row gap-2">
                {raffle.prices.slice(1).map((price) => (
                  <div
                    key={price.id}
                    className="bg-red-700 py-1 px-3 rounded-lg text-sm w-fit text-white"
                  >
                    <span className="">{price.quantity} cotas por </span>
                    <span className="font-bold">
                      {formatCurrency(price.price * price.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {flags.flagProgress && raffle.progress >= 10 && <div className="w-full h-5 bg-foreground/10 rounded-full">
              <div className="animate-pulse flex items-center justify-center h-full bg-red-600 rounded-full" style={{ width: `${raffle.progress}%` }}>
                <span className="text-white text-[11px] font-bold">
                  {raffle.progress.toFixed(2)}%
                </span>
              </div>
            </div>}
          </>
        )}
      </div>

      {raffle.status === "active" && (
        <>
          <QuantitySelector
            raffle={{
              id: raffle.id,
              title: raffle.title,
              preQuantityNumbers: raffle.preQuantityNumbers,
              prices: raffle.prices.map((price) => ({
                id: price.id,
                price: price.price,
                quantity: price.quantity,
              })),
            }}
          />
          {flags.flagTopBuyers && (
            <TopBuyers
              title="Top compradores"
              topBuyers={raffle.topBuyers?.map((buyer) => ({
                id: buyer.whatsapp,
                name: buyer.name,
                quantity: buyer.total,
              }))}
            />
          )}

          {flags.flagTopBuyersWeek && (
            <TopBuyers
              title="Top compradores da semana"
              subtitle={topBuyersWeekSubtitle}
              topBuyers={raffle.topBuyersWeek?.map((buyer) => ({
                id: buyer.whatsapp,
                name: buyer.name,
                quantity: buyer.total,
              }))}
            />
          )}

          {flags.flagTopBuyersDay && (
            <TopBuyers
              title="Top compradores do dia"
              subtitle={topBuyersDaySubtitle}
              topBuyers={raffle.topBuyersDay?.map((buyer) => ({
                id: buyer.whatsapp,
                name: buyer.name,
                quantity: buyer.total,
              }))}
            />
          )}

          {flags.flagHighestQuota && (
            <TopBuyers
              title="Maior cota"
              isReferenceNumber
              topBuyers={
                raffle.highestQuota
                  ? [
                      {
                        id: raffle.highestQuota?.whatsapp,
                        name: raffle.highestQuota?.name,
                        quantity: 1,
                        referenceNumber: raffle.highestQuota?.referenceNumber
                          .toString()
                          .padStart(6, "0"),
                      },
                    ]
                  : []
              }
            />
          )}

          {flags.flagLowestQuota && (
            <TopBuyers
              title="Menor cota"
              isReferenceNumber
              topBuyers={
                raffle.lowestQuota
                  ? [
                      {
                        id: raffle.lowestQuota?.whatsapp,
                        name: raffle.lowestQuota?.name,
                        quantity: 1,
                        referenceNumber: raffle.lowestQuota?.referenceNumber
                          .toString()
                          .padStart(6, "0"),
                      },
                    ]
                  : []
              }
            />
          )}

          <AwardQuotes
            awardedQuotes={raffle.awardedQuotes?.map((quote) => ({
              id: quote.id,
              gift: quote.gift,
              referenceNumber: quote.referenceNumber,
              user: quote.user,
            }))}
          />
        </>
      )}
      {raffle.status === "finished" && (
        <TopBuyers
          title="Ganhador"
          isReferenceNumber
          topBuyers={
            winner
              ? [
                  {
                    id: winner.whatsapp,
                    name: winner.name,
                    quantity: 1,
                    referenceNumber: winner.serial_number,
                  },
                ]
              : []
          }
        />
      )}

      <div className="flex flex-col gap-2 text-white">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          <h2 className="text-lg font-bold">Descrição e regras:</h2>
        </div>
        <p className="text-sm font-normal">{raffle.description}</p>
      </div>

      <WhatsappSuport />
    </div>
  );
}

export default SorteioPage;
