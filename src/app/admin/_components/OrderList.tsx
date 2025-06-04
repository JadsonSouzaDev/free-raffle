"use client";

import { formatCurrency } from "@/app/utils/currency";
import { formatDate } from "@/app/utils/data";
import { DataList } from "./DataList";

type OrderStatus =
  | "pending"
  | "waiting_payment"
  | "completed"
  | "canceled"
  | "refunded"
  | "expired";

const statusMap = {
  pending: "Aguardando Pagamento",
  waiting_payment: "Aguardando Pagamento",
  completed: "Pago",
  canceled: "Cancelado",
  refunded: "Reembolsado",
  expired: "Expirado",
};

interface Order {
  id: string;
  raffleId: string;
  userId: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  payment?: {
    amount: number;
  };
  quotas: number[];
}

export function OrderList({ orders }: { orders: Order[] }) {
  return (
    <DataList<Order>
      data={orders}
      fields={[
        {
          key: "id",
          label: "ID",
          render: (value) => `#${(value as string).slice(-8)}`,
        },
        {
          key: "userId",
          label: "WhatsApp",
          render: (value) => {
            const whatsapp = (value as string).replace("+55", "");
            return whatsapp.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
          },
        },
        {
          key: "quantity",
          label: "Quantidade",
          render: (value) => `${value} cota(s)`,
        },
        {
          key: "payment",
          label: "Valor",
          render: (value) =>
            value
              ? formatCurrency((value as Order["payment"])?.amount || 0)
              : "-",
        },
        {
          key: "status",
          label: "Status",
          render: (value) => (
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                value === "completed"
                  ? "bg-red-100 text-red-800"
                  : value === "waiting_payment" || value === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {statusMap[value as OrderStatus]}
            </span>
          ),
        },
        {
          key: "createdAt",
          label: "Data",
          render: (value) => (
            <span className="text-xs text-foreground/50">
              {formatDate(value as string)}
            </span>
          ),
        },
      ]}
      onEdit={(order) => {
        console.log("Editar pedido", order);
      }}
    />
  );
}
