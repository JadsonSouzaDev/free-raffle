"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { getUserByWhatsapp } from "@/app/contexts/user/user.actions";
import useSWR from "swr";

interface WhatsappModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (whatsapp: string) => void;
}

const WhatsappModal = ({
  open,
  onClose: externalOnClose,
  onSubmit,
}: WhatsappModalProps) => {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoading } = useSWR(
    whatsapp.length === 15 ? `/api/users?whatsapp=${whatsapp}` : null,
    () => getUserByWhatsapp(whatsapp)
  );

  if (!open) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      onSubmit(whatsapp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    externalOnClose();
    setWhatsapp("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Meus Pedidos</h2>
          <button
            onClick={onClose}
            className="text-foreground cursor-pointer hover:text-foreground/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">
              Informe seu WhatsApp para ver seus pedidos
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

          <button
            onClick={handleSubmit}
            disabled={loading || !whatsapp || whatsapp.length !== 15 || isLoading}
            className="bg-foreground text-white p-2 rounded-lg disabled:opacity-50 cursor-pointer mt-4"
          >
            {loading || isLoading ? "Carregando..." : "Ver pedidos"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsappModal; 