"use client";

import { CheckCircle, Minus, Plus } from "lucide-react";
import QuantityButton from "./quantity-button";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/app/utils/currency";
import OrderModal from "./order-modal";

interface SerializedRaffle {
  id: string;
  title: string;
  prices: {
    id: string;
    price: number;
    quantity: number;
  }[];
}

const QuantitySelector = ({ raffle }: { raffle: SerializedRaffle }) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);

  const currentPrice = useMemo(() => 
    [...raffle.prices]
      .sort((a, b) => b.quantity - a.quantity)
      .find((p) => selectedQuantity >= p.quantity)?.price ?? 0,
    [raffle.prices, selectedQuantity]
  );

  const handleQuantityClick = (quantity: number) => {
    setSelectedQuantity((prev) => prev + quantity);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {[
          ...new Set([
            25,
            50,
            100,
            200,
            300,
            Math.max(...raffle.prices.map((p) => p.quantity)),
          ]),
        ]
          .sort((a, b) => a - b)
          .map((value) => (
            <QuantityButton
              key={value}
              value={value}
              raffle={raffle}
              onClick={() => handleQuantityClick(value)}
            />
          ))}
      </div>
      <div className="md:grid md:grid-cols-4 gap-2 hidden ">
        {[
          ...new Set([
            10,
            25,
            50,
            100,
            200,
            300,
            400,
            Math.max(...raffle.prices.map((p) => p.quantity)),
          ]),
        ]
          .sort((a, b) => a - b)
          .map((value) => (
            <QuantityButton
              key={value}
              value={value}
              raffle={raffle}
              onClick={() => handleQuantityClick(value)}
            />
          ))}
      </div>

      <div className="flex flex-col gap-2 ">
        <div className="flex flex-row items-center justify-between w-full md:w-[300px] mx-auto gap-2 rounded-xl bg-white backdrop-blur-sm border border-white shadow-lg text-foreground p-2">
          <button
            onClick={() => handleQuantityClick(-1)}
            disabled={selectedQuantity <= 1}
            className="cursor-pointer hover:bg-foreground/90 bg-foreground text-white p-3 rounded-lg transition-colors duration-300 flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            value={selectedQuantity}
            onChange={(e) =>
              handleQuantityClick(Number(e.target.value) - selectedQuantity)
            }
            className="font-bold text-xl md:text-2xl w-20 text-center bg-transparent border-none focus:outline-none"
            min="0"
          />
          <button
            onClick={() => handleQuantityClick(1)}
            className="cursor-pointer hover:bg-foreground/90 bg-foreground text-white p-3 rounded-lg transition-colors duration-300 flex flex-col items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={() => setOpen(true)} disabled={selectedQuantity < 1} className="cursor-pointer w-full bg-green-700 hover:bg-green-800 text-white shadow-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
          <div className="flex flex-row items-center justify-center mx-auto gap-3 p-2">
            <CheckCircle className="w-6 h-6 " />
            <span className="font-bold text-base md:text-lg">
              Quero participar
            </span>
            <span className="font-bold text-lg md:text-xl  border-white/60 border-2 text-white px-2 py-1 rounded-md">
              {formatCurrency(currentPrice * selectedQuantity)}
            </span>
          </div>
        </button>
      </div>

      <OrderModal open={open} onClose={() => setOpen(false)} raffleId={raffle.id} raffleTitle={raffle.title} quantity={selectedQuantity} />
    </div>
  );
};

export default QuantitySelector;
