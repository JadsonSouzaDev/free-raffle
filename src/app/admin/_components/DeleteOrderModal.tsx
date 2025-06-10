"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { deleteOrder } from "@/app/contexts/order/order.actions";
import { toast } from "sonner";

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    status: string;
  } | null;
}

export default function DeleteOrderModal({ isOpen, onClose, order }: DeleteOrderModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !order) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteOrder(order.id);
      onClose();
      toast.success("Pedido excluído com sucesso");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch {
      toast.error("Erro ao excluir pedido");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl py-4 md:py-6 w-full max-w-md text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8 px-4 md:px-6">
          <h2 className="text-xl font-bold">Excluir Pedido</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-foreground hover:text-foreground/80"
            disabled={isDeleting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 px-4 md:px-6">
          <p className="text-sm">
            Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}