import { Search, X } from "lucide-react";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import {
  searchQuota,
  adjustQuotaNumber,
} from "@/app/contexts/raffle/quota.actions";

interface AdjustQuotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffleId: string;
}

interface QuotaError {
  message: string;
}

const AdjustQuotasModal = ({
  isOpen,
  onClose,
  raffleId,
}: AdjustQuotasModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newReferenceNumber, setNewReferenceNumber] = useState("");
  const [isPristine, setIsPristine] = useState(true);

  const {
    trigger: searchQuotaTrigger,
    data: quotaData,
    isMutating: isSearching,
  } = useSWRMutation("searchQuota", async () => {
    if (!searchTerm) return undefined;
    return await searchQuota(raffleId, Number(searchTerm));
  });

  const { trigger: adjustQuotaTrigger, isMutating: isAdjusting } =
    useSWRMutation("adjustQuota", async () => {
      if (!quotaData || !newReferenceNumber) return;
      return await adjustQuotaNumber(
        raffleId,
        quotaData.id,
        Number(newReferenceNumber),
        quotaData.owner_phone
      );
    });

  const handleSearch = async () => {
    try {
      await searchQuotaTrigger();
    } catch (error) {
      const err = error as QuotaError;
      toast.error(err.message || "Erro ao buscar cota");
    }
  };

  const handleAdjustQuota = async () => {
    try {
      const result = await adjustQuotaTrigger();
      if (result?.success) {
        toast.success(result.message);
        onClose();
        setIsPristine(true);
      }
    } catch (error) {
      const err = error as QuotaError;
      toast.error(err.message || "Erro ao ajustar número da cota");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl p-4 md:p-6 w-full max-w-2xl text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8">
          <h2 className="text-xl font-bold">Ajustar Número da Cota</h2>
          <button
            onClick={() => {
              setSearchTerm("");
              setNewReferenceNumber("");
              setIsPristine(true);
              onClose();
            }}
            className="text-foreground cursor-pointer hover:text-foreground/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Seção de Busca */}
          <div className="flex gap-2 flex-col">
            <label className="block text-sm font-medium mb-2">Cota</label>
            <div className="flex gap-2 w-full">
              <input
                type="number"
                className="md:w-1/2 p-2 border rounded-md"
                placeholder="Buscar cota por número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => setIsPristine(false)}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm}
                className={`cursor-pointer px-3 py-2 flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Buscar</span>
              </button>
            </div>
          </div>

          {/* Exibição da Cota Encontrada */}
          {quotaData && (
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Cota Encontrada:</h4>
              <div className="space-y-1 text-sm">
                <p>
                  Número:{" "}
                  <span className="font-medium">{quotaData.serial_number}</span>
                </p>
                <p>
                  Comprador:{" "}
                  <span className="font-medium">{quotaData.owner_name}</span>
                </p>
                <p>
                  Telefone:{" "}
                  <span className="font-medium">{quotaData.owner_phone}</span>
                </p>
                {/* Desabilitando bloqueio de cota premiada */}
                {/* {quotaData.is_awarded && (
                  <p className="text-red-500 font-medium">
                    Esta cota é premiada e não pode ser alterada
                  </p>
                )} */}
              </div>

              {/* {!quotaData.is_awarded && ( */}
                <>
                  <div className="mt-4">
                    <input
                      type="number"
                      placeholder="Novo número da cota..."
                      value={newReferenceNumber}
                      onChange={(e) => setNewReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleAdjustQuota}
                    disabled={isAdjusting || !newReferenceNumber}
                    className="cursor-pointer w-full mt-2 px-4 py-2 bg-foreground text-white rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdjusting ? "Processando..." : "Ajustar Número"}
                  </button>
                </>
              {/* )} */}
            </div>
          )}

          {quotaData === null && !isPristine && (
            <div className="flex flex-col gap-2 items-center justify-center text-red-500 border border-red-500 rounded-lg p-4">
              <p className="text-sm font-bold">Cota não encontrada</p>
              <p className="text-xs">
                Verifique se o número da cota está correto e tente novamente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdjustQuotasModal;
