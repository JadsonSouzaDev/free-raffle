"use client";

import { X } from "lucide-react";
import { useState } from "react";
import UserSelect from "./UserSelect";
import { updateOrderUser } from "@/app/contexts/order/order.actions";
import { toast } from "sonner";

interface ChangeOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    userId: string;
  } | null;
}

export function ChangeOwnerModal({ isOpen, onClose, order }: ChangeOwnerModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    if (!selectedUserId) return;

    try {
      setIsUpdating(true);
      await updateOrderUser(order.id, selectedUserId);
      onClose();
      window.location.reload();
      toast.success("Titular atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar titular");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl py-4 md:py-6 w-full max-w-md text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8 px-4 md:px-6">
          <h2 className="text-xl font-bold">Alterar Titular</h2>
          <button
            onClick={onClose}
            className="text-foreground cursor-pointer hover:text-foreground/80"
            disabled={isUpdating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 px-4 md:px-6">
          <UserSelect
            onChange={(value) => setSelectedUserId(value)}
          />

          <button
            onClick={handleSubmit}
            disabled={isUpdating || !selectedUserId}
            className="w-full bg-foreground text-white p-2 rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? "Atualizando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
} 