"use client";

import { formatCurrency } from "@/app/utils/currency";
import { formatDate } from "@/app/utils/data";
import { DataList } from "./DataList";
import { Raffle } from "@/app/contexts/raffle/entities";

type RaffleListProps = {
  raffles: {
    id: string;
    title: string;
    status: "active" | "finished";
    createdAt: string;
    prices: {
      id: string;
      price: number;
      quantity: number;
    }[];
  }[];
};

export function RaffleList({ raffles }: RaffleListProps) {
  return (
    <DataList<RaffleListProps["raffles"][number]>
      data={raffles}
      fields={[
        {
          key: "id",
          label: "ID",
        },
        {
          key: "title",
          label: "Título",
        },
        {
          key: "status",
          label: "Status",
          render: (value) => (
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                value === "active"
                  ? "bg-red-100 text-red-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {value === "active" ? "Ativo" : "Finalizado"}
            </span>
          ),
        },
        {
          key: "prices",
          label: "Preço inicial",
          render: (prices) =>
            formatCurrency(
              Math.min(...(prices as Raffle["prices"]).map((p) => p.price))
            ),
        },
        {
          key: "createdAt",
          label: "Data de criação",
          render: (value) => formatDate(value as string),
        },
      ]}
      onEdit={(raffle) => {
        console.log("Editar", raffle);
      }}
      onDelete={(raffle) => {
        console.log("Deletar", raffle);
      }}
    />
  );
}
