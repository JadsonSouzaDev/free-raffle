"use client";

import { useState, useEffect } from "react";
import WhatsappModal from "./_components/whatsapp-modal";
import { getOrdersByUser } from "../contexts/order/order.actions";
import { formatDate } from "../utils/data";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "../utils/currency";
import { formatTimeRemaining } from "../utils/time";

interface Order {
  id: string;
  raffleId: string;
  userId: string;
  quantity: number;
  status: string;
  createdAt: string;
  payment?: {
    qrCode: string;
    qrCodeBase64: string;
    amount: number;
  };
  quotas: number[];
}

const statusMap = {
  pending: "Aguardando Pagamento",
  waiting_payment: "Aguardando Pagamento",
  completed: "Pago",
  canceled: "Cancelado",
  refunded: "Reembolsado",
  expired: "Expirado",
};

const statusColorMap = {
  pending: "bg-yellow-500/20 text-yellow-700",
  waiting_payment: "bg-yellow-500/20 text-yellow-700",
  completed: "bg-green-500/20 text-green-700",
  canceled: "bg-red-500/20 text-red-700",
  refunded: "bg-red-500/20 text-red-700",
  expired: "bg-red-500/20 text-red-700",
};

export default function PedidosPage() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const whatsappParam = searchParams.get("whatsapp");

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [modalOpen, setModalOpen] = useState(!orderIdParam || !whatsappParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orderIdParam
  );
  const [currentWhatsapp, setCurrentWhatsapp] = useState<string | null>(
    whatsappParam
  );

  useEffect(() => {
    if (whatsappParam) {
      handleWhatsappSubmit(whatsappParam);
    }
  }, [whatsappParam]);

  // Função para conectar ao SSE
  useEffect(() => {
    if (!currentWhatsapp) return;

    const eventSource = new EventSource("/api/webhooks/mercadopago");

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "payment") {
        // Atualiza a lista de pedidos
        await handleWhatsappSubmit(currentWhatsapp);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [currentWhatsapp]);

  // Adicionar novo useEffect para atualizar o tempo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());      
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleWhatsappSubmit = async (whatsapp: string) => {
    setLoading(true);
    try {
      const userOrders = await getOrdersByUser(whatsapp);
      setOrders(userOrders);
      setModalOpen(false);
      setCurrentWhatsapp(whatsapp);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = orderIdParam
    ? orders.filter((order) => order.id === orderIdParam)
    : orders;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl md:text-2xl font-bold">Meus Pedidos</h1>

      <WhatsappModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleWhatsappSubmit}
      />

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <span className="text-lg">Carregando pedidos...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex cursor-pointer flex-col gap-2 p-4 rounded-xl bg-white backdrop-blur-sm border border-white shadow-lg text-foreground"
              onClick={() =>
                ["pending", "waiting_payment", "completed"].includes(
                  order.status
                ) && toggleOrderExpansion(order.id)
              }
            >
              <div className="flex justify-between items-center cursor-pointer">
                <span className="font-bold">Pedido #{order.id.slice(-12)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-70">
                    {formatDate(order.createdAt)}
                  </span>
                  {["pending", "waiting_payment", "completed"].includes(
                    order.status
                  ) && (
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedOrderId === order.id ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                {expandedOrderId !== order.id && (
                  <span className="text-sm opacity-70">
                    {order.quantity} cota(s)
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm opacity-70 font-bold">
                    {order.payment?.amount ? formatCurrency(order.payment.amount) : "Não pago"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                      statusColorMap[
                        order.status as keyof typeof statusColorMap
                      ]
                    }`}
                  >
                    {statusMap[order.status as keyof typeof statusMap]}
                  </span>
                </div>
              </div>

              {expandedOrderId === order.id && order.payment && (
                <>
                  {order.status === "waiting_payment" && (
                    <div className="flex flex-col items-center gap-4 mt-4 p-4 border-t">
                      <p className="text-sm text-center opacity-70">
                        Escaneie o QR Code abaixo para pagar via PIX
                      </p>

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-foreground h-2.5 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                100 -
                                  ((currentTime -
                                    new Date(order.createdAt).getTime()) /
                                    (5 * 60 * 1000)) *
                                    100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-center opacity-70">
                        Tempo restante para pagamento: {formatTimeRemaining(order.createdAt, currentTime)}
                      </p>
                      <Image
                        src={`data:image/png;base64,${order.payment?.qrCodeBase64}`}
                        alt="QR Code PIX"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                      <button
                        onClick={() => {
                          if (order.payment?.qrCode) {
                            navigator.clipboard.writeText(order.payment.qrCode);
                            alert("Código PIX copiado!");
                          }
                        }}
                        className="text-sm bg-foreground text-white px-4 py-2 rounded-lg hover:bg-foreground/90"
                      >
                        Copiar código PIX
                      </button>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="flex flex-wrap gap-2">
                      {order.quotas.map((quota) => (
                        <span
                          className="bg-green-700 text-white px-2 py-1 rounded-lg text-xs font-bold"
                          key={quota}
                        >
                          {quota}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <span className="text-lg opacity-70">Nenhum pedido encontrado</span>
        </div>
      )}

      {orderIdParam && (
        <Link href="/pedidos">
          <div className="flex justify-center items-center ">

          <button
            className="cursor-pointer bg-foreground text-white px-4 py-2 rounded-lg hover:bg-foreground/90"
            onClick={() => setModalOpen(true)}
            >
            Visualizar todos os pedidos
          </button>
            </div>
        </Link>
      )}
    </div>
  );
}
