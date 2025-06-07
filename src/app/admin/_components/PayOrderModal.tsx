"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { payOrderManually } from "@/app/contexts/order/payment.actions";

interface PayOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    status: string;
  } | null;
}

export default function PayOrderModal({ isOpen, onClose, order }: PayOrderModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      await payOrderManually(order.id);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl py-4 md:py-6 w-full max-w-md text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8 px-4 md:px-6">
          <h2 className="text-xl font-bold">Confirmar Pagamento</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-foreground hover:text-foreground/80"
            disabled={isUpdating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 px-4 md:px-6">
          <p className="text-sm">
            Tem certeza que deseja confirmar o pagamento deste pedido? Esta ação não pode ser desfeita.
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="cursor-pointer px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
            >
              {isUpdating ? "Confirmando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}