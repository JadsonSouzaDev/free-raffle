'use client';

import { useState } from 'react';

interface PriceField {
  id: number;
  quantity: string;
  price: string;
}

export function RaffleForm({ onSubmit }: { onSubmit: (formData: FormData) => Promise<void> }) {
  const [priceFields, setPriceFields] = useState<PriceField[]>([{ id: 0, quantity: '', price: '' }]);

  const addPriceField = () => {
    const newId = priceFields.length > 0 ? Math.max(...priceFields.map(f => f.id)) + 1 : 0;
    setPriceFields([...priceFields, { id: newId, quantity: '', price: '' }]);
  };

  const removePriceField = (id: number) => {
    if (priceFields.length > 1) {
      setPriceFields(priceFields.filter(field => field.id !== id));
    }
  };

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Digite o título da rifa"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Digite a descrição da rifa"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">
            Preços e Quantidades
          </label>
          <button
            type="button"
            onClick={addPriceField}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
          >
            + Adicionar Preço
          </button>
        </div>
        
        <div id="pricesList" className="space-y-4">
          {priceFields.map((field) => (
            <div key={field.id} className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  name={`quantity_${field.id}`}
                  placeholder="Quantidade de cotas"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  min="1"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  name={`price_${field.id}`}
                  placeholder="Preço (R$)"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              {priceFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriceField(field.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Criar Rifa
      </button>
    </form>
  );
} 