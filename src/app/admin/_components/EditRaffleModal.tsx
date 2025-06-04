"use client";

import { useState, useEffect } from 'react';
import { 
  updateTopBuyersFlag,
  updateTopBuyerWeekFlag,
  updateTopBuyerDayFlag,
  updateLowestQuotaFlag,
  updateHighestQuotaFlag,
  getRaffleFlags
} from '@/app/contexts/raffle/raffle-flags.actions';
import useSWR from "swr";

interface EditRaffleModalProps {
  raffleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FlagState = {
  flagTopBuyers: boolean;
  flagTopBuyersWeek: boolean;
  flagTopBuyersDay: boolean;
  flagLowestQuota: boolean;
  flagHighestQuota: boolean;
};

const defaultFlags: FlagState = {
  flagTopBuyers: false,
  flagTopBuyersWeek: false,
  flagTopBuyersDay: false,
  flagLowestQuota: false,
  flagHighestQuota: false,
};

const EditRaffleModal = ({ raffleId, isOpen, onClose, onSuccess }: EditRaffleModalProps) => {
  const { data: flags, mutate } = useSWR(
    isOpen ? `/api/raffles/${raffleId}/flags` : null, 
    () => getRaffleFlags(raffleId)
  );
  
  const [flagsState, setFlagsState] = useState<FlagState>(defaultFlags);
  const [loadingFlags, setLoadingFlags] = useState<Partial<Record<keyof FlagState, boolean>>>({});

  useEffect(() => {
    if (flags) {
      setFlagsState({
        flagTopBuyers: flags.flagTopBuyers,
        flagTopBuyersWeek: flags.flagTopBuyersWeek,
        flagTopBuyersDay: flags.flagTopBuyersDay,
        flagLowestQuota: flags.flagLowestQuota,
        flagHighestQuota: flags.flagHighestQuota,
      });
    }
  }, [flags]);

  const handleToggle = async (flag: keyof FlagState) => {
    try {
      setLoadingFlags(prev => ({ ...prev, [flag]: true }));
      const newValue = !flagsState[flag];

      // Atualiza o estado local imediatamente para feedback visual
      setFlagsState(prev => ({
        ...prev,
        [flag]: newValue
      }));

      // Chama a action correspondente
      const updateFlagAction = {
        flagTopBuyers: updateTopBuyersFlag,
        flagTopBuyersWeek: updateTopBuyerWeekFlag,
        flagTopBuyersDay: updateTopBuyerDayFlag,
        flagLowestQuota: updateLowestQuotaFlag,
        flagHighestQuota: updateHighestQuotaFlag
      }[flag];

      await updateFlagAction(raffleId, newValue);
      await mutate(); // Atualiza os dados após salvar
      onSuccess?.();
    } catch (error) {
      // Em caso de erro, reverte o estado local
      setFlagsState(prev => ({
        ...prev,
        [flag]: !prev[flag]
      }));
      console.error(`Erro ao atualizar flag ${flag}:`, error);
    } finally {
      setLoadingFlags(prev => ({ ...prev, [flag]: false }));
    }
  };

  if (!flags && isOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white text-foreground rounded-lg p-6">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/50 p-4 flex items-center backdrop-blur-xs justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white text-foreground rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar Sorteio</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Compradores */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Exibir Top Compradores</label>
            <button
              onClick={() => handleToggle('flagTopBuyers')}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flagsState.flagTopBuyers ? 'bg-red-600' : 'bg-gray-200'
              }`}
              disabled={loadingFlags.flagTopBuyers}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  flagsState.flagTopBuyers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Top Comprador da Semana */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Exibir Top Comprador da Semana</label>
            <button
              onClick={() => handleToggle('flagTopBuyersWeek')}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flagsState.flagTopBuyersWeek ? 'bg-red-600' : 'bg-gray-200'
              }`}
              disabled={loadingFlags.flagTopBuyersWeek}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  flagsState.flagTopBuyersWeek ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Top Comprador do Dia */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Exibir Top Comprador do Dia</label>
            <button
              onClick={() => handleToggle('flagTopBuyersDay')}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flagsState.flagTopBuyersDay ? 'bg-red-600' : 'bg-gray-200'
              }`}
              disabled={loadingFlags.flagTopBuyersDay}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  flagsState.flagTopBuyersDay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Menor Cota */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Exibir Menor Cota</label>
            <button
              onClick={() => handleToggle('flagLowestQuota')}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flagsState.flagLowestQuota ? 'bg-red-600' : 'bg-gray-200'
              }`}
              disabled={loadingFlags.flagLowestQuota}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  flagsState.flagLowestQuota ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Maior Cota */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Exibir Maior Cota</label>
            <button
              onClick={() => handleToggle('flagHighestQuota')}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flagsState.flagHighestQuota ? 'bg-red-600' : 'bg-gray-200'
              }`}
              disabled={loadingFlags.flagHighestQuota}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  flagsState.flagHighestQuota ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRaffleModal;
