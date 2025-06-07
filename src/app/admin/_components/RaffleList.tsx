"use client";

import { formatCurrency } from "@/app/utils/currency";
import { formatDateAndTime } from "@/app/utils/data";
import { DataList } from "./DataList";
import { Raffle, RaffleAwardQuotes } from "@/app/contexts/raffle/entities";
import CopyText from "./CopyText";
import { useState } from "react";
import EditRaffleModal from "./EditRaffleModal";
import CreateRaffleModal from "./CreateRaffleModal";
import { Gift } from "lucide-react";
import { DrawModal } from "./DrawModal";

type RaffleListProps = {
  raffles: {
    id: string;
    title: string;
    status: "active" | "finished";
    description: string;
    createdAt: string;
    quotasSold: number;
    awardedQuotes: {
      id: string;
      referenceNumber: number;
      gift: string;
    }[];
    prices: {
      id: string;
      price: number;
      quantity: number;
    }[];
  }[];
};

const statusColors = {
  active: "bg-green-500 text-white",
  finished: "bg-yellow-500 text-white",
};

export function RaffleList({ raffles }: RaffleListProps) {
  const [isCreateRaffleModalOpen, setIsCreateRaffleModalOpen] = useState(false);
  const [isEditRaffleModalOpen, setIsEditRaffleModalOpen] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  const handleDraw = async (number: string) => {
    if (!selectedRaffle) return;

    try {
      // TODO: Implementar a chamada para realizar o sorteio
      console.log("Realizando sorteio", {
        raffleId: selectedRaffle.id,
        number,
      });
      
      setIsDrawModalOpen(false);
      setSelectedRaffle(null);
    } catch (error) {
      console.error("Erro ao realizar sorteio:", error);
      alert("Erro ao realizar o sorteio. Tente novamente.");
    }
  };

  return (
    <>
      <DataList<RaffleListProps["raffles"][number]>
        data={raffles}
        fields={[
          {
            key: "id",
            label: "ID",
            render: (value, item) => (
              <div className="flex flex-row gap-2 items-center">
                <span
                  className={`text-xs min-w-3 min-h-3 rounded-full flex items-center justify-center ${
                    statusColors[item.status as keyof typeof statusColors]
                  }`}
                ></span>
                <CopyText text={value as string} />
              </div>
            ),
          },
          {
            key: "title",
            label: "Título",
          },
          {
            key: "status",
            label: "Status",
            onlyDetail: true,
            render: (value) => (
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  statusColors[value as keyof typeof statusColors]
                }`}
              >
                {value === "active" ? "Ativo" : "Finalizado"}
              </span>
            ),
          },
          {
            key: "quotasSold",
            label: "Cotas",
            render: (value) => (
              <div className="flex gap-1 w-[150px] items-center">
                <span className="text-xs px-2 py-1 rounded-xl font-bold bg-foreground/70 text-white">
                  {(999999 - (value as number)).toString().padStart(6, "0")} L
                </span>
                <span className="text-xs px-2 py-1 rounded-xl font-bold bg-green-500 text-white">
                  {(value as number).toString().padStart(6, "0")} P
                </span>
              </div>
            ),
          },
          {
            key: "description",
            label: "Descrição",
            onlyDetail: true,
            render: (value) => (
              <span className="text-xs">{value as string}</span>
            ),
          },
          {
            key: "prices",
            label: "Pacotes disponíveis",
            onlyDetail: true,
            render: (prices) => {
              const pricesList = prices as Raffle["prices"];
              return (
                <div className="flex flex-row flex-wrap gap-1">
                  {pricesList.map((price: Raffle["prices"][number]) => (
                    <span
                      key={price.id}
                      className="bg-foreground/70 text-white px-3 py-1 rounded-xl font-bold text-xs"
                    >
                      {formatCurrency(price.price)} - {price.quantity} cota(s)
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            key: "awardedQuotes",
            label: "Cota(s) premiadas",
            onlyDetail: true,
            render: (value) => {
              const awardedQuotes = value as RaffleAwardQuotes[];
              return (
                <div className="flex flex-row flex-wrap gap-1">
                  {awardedQuotes?.map((quote: RaffleAwardQuotes) => (
                    <span
                      key={quote.id}
                      className="bg-foreground/70 text-white px-3 py-1 rounded-xl font-bold text-xs"
                    >
                      {quote.referenceNumber} - {quote.gift}
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            key: "createdAt",
            label: "Data de criação",
            onlyDetail: true,
            render: (value) => formatDateAndTime(value as string),
          },
        ]}
        onEditCondition={(raffle) => raffle.status === "active"}
        onEdit={(raffle) => {
          setSelectedRaffle(raffle as unknown as Raffle);
          setIsEditRaffleModalOpen(true);
        }}
        onDelete={(raffle) => {
          console.log("Deletar", raffle);
        }}
        onCreate={() => {
          setIsCreateRaffleModalOpen(true);
        }}
        customActions={[
          {
            icon: <Gift className="w-4 h-4" />,
            label: "Sortear",
            onClick: (raffle) => {
              setSelectedRaffle(raffle as unknown as Raffle);
              setIsDrawModalOpen(true);
            },
            condition: (raffle) =>
              raffle.status === "active" && raffle.quotasSold > 0,
            className: "bg-yellow-500 hover:text-yellow-300 md:bg-transparent md:hover:bg-white/10 md:rounded-lg md:p-1",
          },
        ]}
      />
      <EditRaffleModal
        raffleId={selectedRaffle?.id ?? ""}
        isOpen={isEditRaffleModalOpen}
        onClose={() => setIsEditRaffleModalOpen(false)}
      />
      <CreateRaffleModal
        open={isCreateRaffleModalOpen}
        onClose={() => setIsCreateRaffleModalOpen(false)}
      />
      <DrawModal
        isOpen={isDrawModalOpen}
        onClose={() => {
          setIsDrawModalOpen(false);
          setSelectedRaffle(null);
        }}
        onDraw={handleDraw}
        raffleId={selectedRaffle?.id ?? ""}
      />
    </>
  );
}
