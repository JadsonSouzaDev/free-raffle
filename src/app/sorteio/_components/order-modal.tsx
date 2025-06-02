"use client";
import { X } from "lucide-react";
import { useState } from "react";
import {
  createUser,
  getUserByWhatsapp,
} from "@/app/contexts/user/user.actions";
import useSWR from "swr";
import { createOrder } from "@/app/contexts/order/order.actions";
import { useRouter } from "next/navigation";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  raffleId: string;
  raffleTitle: string;
  quantity: number;
}

const OrderModal = ({
  open,
  onClose: externalOnClose,
  raffleId,
  raffleTitle,
  quantity,
}: OrderModalProps) => {
  const [step, setStep] = useState<"whatsapp" | "name" | "qrcode">("whatsapp");
  const [whatsapp, setWhatsapp] = useState("");
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState<{ id: string; name: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { data: user, isLoading } = useSWR(
    whatsapp.length === 15 ? `/api/users?whatsapp=${whatsapp}` : null,
    () => getUserByWhatsapp(whatsapp)
  );

  if (!open) return <></>;

  const handleWhatsappSubmit = async () => {
    if (user) {
      setCustomer({ id: user.whatsapp, name: user.name });
      setName(user.name);
      setStep("name");
    } else {
      setStep("name");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let userId = customer?.id;
      if (!customer) {
        // Criar novo cliente
        const newUser = await createUser({ name, whatsapp });
        setCustomer({ id: newUser.whatsapp, name: newUser.name });
        userId = newUser.whatsapp;
      }

      const order = await createOrder({
        userId: userId!,
        raffleId: raffleId,
        quantity: quantity,
      });

      router.push(`/pedidos?orderId=${order.id}&whatsapp=${whatsapp}`);

      // Continuar com o processo de compra
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    externalOnClose();
    setWhatsapp("");
    setName("");
    setCustomer(null);
    setStep("whatsapp");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Finalizar Compra</h2>
          <button
            onClick={onClose}
            className="text-foreground cursor-pointer hover:text-foreground/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-2 pb-8">
          <div className="flex border border-green-700 rounded-lg p-2 bg-green-700/10 text-green-700">
            <p className="text-base">
              Você está comprando <span className="font-bold">{quantity}</span>{" "}
              cota(s) do sorteio{" "}
              <span className="font-bold">{raffleTitle}</span>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Após finalizar a compra, você receberá um link para pagamento.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">
              Informe seu WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formattedValue = value.replace(
                  /^(\d{2})(\d{5})(\d{4}).*/,
                  "($1) $2-$3"
                );
                setWhatsapp(formattedValue);
              }}
              placeholder="(00) 00000-0000"
              className="w-full p-2 border rounded-lg"
              maxLength={15}
            />
          </div>

          {step === "whatsapp" ? (
            <button
              onClick={handleWhatsappSubmit}
              disabled={
                loading || !whatsapp || whatsapp.length !== 15 || isLoading
              }
              className="bg-foreground text-white p-2 rounded-lg disabled:opacity-50 cursor-pointer mt-4"
            >
              {loading || isLoading ? "Carregando..." : "Continuar"}
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">
                  Informe seu nome
                </label>
                <input
                  disabled={loading || !!user}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full p-2 border rounded-lg disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !name}
                className="bg-foreground text-white p-2 rounded-lg disabled:opacity-50 cursor-pointer mt-4"
              >
                {loading ? "Processando..." : "Finalizar Compra"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
