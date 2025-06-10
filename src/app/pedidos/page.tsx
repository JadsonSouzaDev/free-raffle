"use client";

import { useState, useEffect, Suspense } from "react";
import WhatsappModal from "./_components/whatsapp-modal";
import { getOrdersByUser } from "../contexts/order/order.actions";
import { formatDateAndTime } from "../utils/data";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "../utils/currency";
import { formatTimeRemaining } from "../utils/time";
import confetti from "canvas-confetti";

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
  isWinner?: boolean;
  winnerQuotas?: number[];
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
  pending: "bg-yellow-500 text-yellow-700",
  waiting_payment: "bg-yellow-400 text-yellow-700",
  completed: "bg-green-500/50 text-white",
  canceled: "bg-red-500/50 text-white",
  refunded: "bg-yellow-500/50 text-white",
  expired: "bg-red-500/50 text-white",
};

export default function PedidosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center p-8">
          <span className="text-lg">Carregando...</span>
        </div>
      }
    >
      <PedidosContent />
    </Suspense>
  );
}

function PedidosContent() {
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

  useEffect(() => {
    if (!currentWhatsapp || !orderIdParam) return;

    const startTime = Date.now();
    const TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos
    let eventSource: EventSource | null = null;

    const createEventSource = () => {
      // Se já existe uma conexão, feche-a
      if (eventSource) {
        eventSource.close();
      }

      // Verifica se já passou do timeout
      if (Date.now() - startTime >= TIMEOUT) {
        console.log("Timeout atingido após 5 minutos");
        return;
      }

      // Cria nova conexão
      eventSource = new EventSource(`/api/webhooks/mercadopago?orderId=${orderIdParam}`);

      eventSource.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "payment" && data.orderId === orderIdParam) {
          await handleWhatsappSubmit(currentWhatsapp);
          if (eventSource) {
            eventSource.close();
          }
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        if (eventSource) {
          eventSource.close();
        }

        // Tenta reconectar após 1 segundo se ainda estiver dentro do timeout
        if (Date.now() - startTime < TIMEOUT) {
          setTimeout(createEventSource, 1000);
        }
      };
    };

    // Inicia a primeira conexão
    createEventSource();

    // Cleanup function
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentWhatsapp, orderIdParam]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Dispara o confete quando encontrar um pedido vencedor
    const hasWinner = orders.some(order => order.isWinner);
    if (hasWinner) {
      const end = Date.now() + 1000;
      const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF0000', '#8B0000'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [orders]);

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
              className={`relative flex cursor-pointer flex-col gap-2 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg text-white ${
                order.isWinner ? "bg-yellow-600 animate-pulse" : "bg-white/10"
              }`}
              onClick={() =>
                ["pending", "waiting_payment", "completed"].includes(
                  order.status
                ) && toggleOrderExpansion(order.id)
              }
            >
              {order.isWinner && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 100,
                  }}
                />
              )}
              <div className="flex justify-between items-center cursor-pointer">
                <span className="font-bold">Pedido #{order.id.slice(-12)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-70">
                    {formatDateAndTime(order.createdAt)}
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
                    {order.status === "completed"
                      ? `${order.quantity} cota${order.quantity > 1 ? "s" : ""}`
                      : ""}
                    {order.winnerQuotas && order.winnerQuotas.length > 0 && (
                      <span className="font-bold bg-yellow-500 p-1 text-white rounded-lg ml-1 animate-pulse">
                        {
                          `${order.winnerQuotas.length} cota${
                            order.winnerQuotas.length > 1 ? "s" : ""
                          } premiada${
                            order.winnerQuotas.length > 1 ? "s" : ""
                          }`}
                      </span>
                    )}
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm opacity-80 font-bold">
                    {order.payment?.amount
                      ? formatCurrency(order.payment.amount)
                      : "Não pago"}
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
                        Tempo restante para pagamento:{" "}
                        {formatTimeRemaining(order.createdAt, currentTime)}
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
                          className={`text-white px-2 py-1 rounded-lg text-xs font-bold ${order.winnerQuotas?.includes(quota) ? "bg-yellow-600 animate-pulse" : "bg-red-700"}`}
                          key={quota}
                        >
                          {quota.toString().padStart(6, "0")}
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
