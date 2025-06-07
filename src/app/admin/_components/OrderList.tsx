"use client";

import { formatCurrency } from "@/app/utils/currency";
import { formatDateAndTime } from "@/app/utils/data";
import { DataList } from "./DataList";
import CopyText from "./CopyText";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getOrders } from "@/app/contexts/order/order.actions";
import RaffleSelect from "./RaffleSelect";
import UserSelect from "./UserSelect";
import { DEFAULT_PAGINATION, PaginationRequest, PaginationResponse } from "@/app/contexts/common/pagination";

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

const statusColors = {
  pending: "bg-yellow-500 text-white animate-pulse",
  waiting_payment: "bg-yellow-500 text-white animate-pulse",
  completed: "bg-green-500 text-white",
  canceled: "bg-red-500 text-white",
  refunded: "bg-red-500 text-white",
  expired: "bg-red-500 text-white",
};

const gatewayMap = {
  MERCADO_PAGO: "Mercado Pago",
};

const paymentTypeMap = {
  pix: "Pix",
};

interface Order {
  id: string;
  raffleId: string;
  userId: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  amount: number;
  gateway: string;
  type: string;
  quotas: number[];
  payment?: {
    gateway: string;
    type: string;
    amount: number;
  };
}

export function OrderList({ orders, initialPagination }: { orders: Order[], initialPagination: PaginationResponse }) {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [raffleId, setRaffleId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationRequest>(DEFAULT_PAGINATION);
  const [paginationResponse, setPaginationResponse] = useState<PaginationResponse>(initialPagination);

  const { data: ordersData, isLoading: isLoadingOrders } = useSWR(
    `/api/orders?raffleId=${raffleId}&userId=${userId}&page=${pagination.page}&limit=${pagination.limit}`,
    () => getOrders({ raffleId: raffleId || undefined, userId: userId || undefined, pagination })
  );

  useEffect(() => {
    if (ordersData) {
      const {data, ...rest} = ordersData;
      setFilteredOrders(data as unknown as Order[]);
      setPaginationResponse(rest);
    }
  }, [ordersData, pagination]);
  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="font-bold">Filtrar por</h2>
        <div className="grid md:grid-cols-2 gap-2">
          <RaffleSelect 
            onChange={(value) => {
              setRaffleId(value);
              setPagination(DEFAULT_PAGINATION);
            }}
          />
          <UserSelect
            onChange={(value) => {
              setUserId(value);
              setPagination(DEFAULT_PAGINATION);
            }}
          />
        </div>
      </div>
      <DataList<Order>
        pagination={paginationResponse}
        setPagination={setPagination}
        data={filteredOrders}
        loading={isLoadingOrders}
        fields={[
          {
            key: "id",
            label: "ID",
            render: (value, item) => (
              <div className="flex flex-row gap-2 items-center">
                <span
                  className={`text-xs min-w-3 min-h-3 rounded-full flex items-center justify-center ${
                    statusColors[item.status as OrderStatus]
                  }`}
                ></span>
                <CopyText text={value as string} />
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            onlyDetail: true,
            render: (value) => (
              <span
                className={`px-2 py-1 rounded-lg ${
                  statusColors[value as OrderStatus]
                }`}
              >
                {statusMap[value as OrderStatus]}
              </span>
            ),
          },
          {
            key: "userId",
            label: "Cliente",
            render: (value) => {
              const whatsapp = (value as string).replace("+55", "");
              return whatsapp.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            },
          },
          {
            key: "createdAt",
            label: "Data",
            render: (value) => (
              <span className="">{formatDateAndTime(value as string)}</span>
            ),
          },
          {
            key: "amount",
            label: "Valor",
            render: (value, item) => (value || item.payment?.amount ? formatCurrency(value as number || item.payment?.amount as number) : "-"),
          },
          {
            key: "gateway",
            label: "Gateway de pagamento",
            render: (value, item) => (
              <span className={`py-1 rounded-lg`}>
                {gatewayMap[value as keyof typeof gatewayMap] || gatewayMap[item.payment?.gateway as keyof typeof gatewayMap]}
              </span>
            ),
            onlyDetail: true,
          },
          {
            key: "type",
            label: "Tipo de pagamento",
            render: (value, item) =>
              paymentTypeMap[value as keyof typeof paymentTypeMap] || paymentTypeMap[item.payment?.type as keyof typeof paymentTypeMap],
            onlyDetail: true,
          },
          {
            key: "quotas",
            onlyDetail: true,
            label: "Cota(s)",
            render: (value) => {
              const quotas = value as number[];
              const quotasString =
                quotas.length > 0
                  ? quotas
                      .map((quota) => quota.toString().padStart(6, "0"))
                      .join(", ")
                  : "-";
              return <CopyText text={quotasString} />;
            },
          },
        ]}
        onEdit={(order) => {
          console.log("Editar pedido", order);
        }}
      />
    </>
  );
}
