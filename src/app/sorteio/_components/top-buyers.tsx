"use client";

import { Medal, Trophy, ChevronDown } from "lucide-react";
import { useState } from "react";

const TopBuyers = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Trophy className="w-5 h-5" />
        <h2 className="text-lgs font-bold">Top Compradores</h2>
        <div className="flex items-center p-1 rounded-full bg-foreground/20 animate-pulse">
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: "1",
              name: "Larissa Gomes de Farias",
              quantity: 70168,
            },
            {
              id: "2",
              name: "Gabriel Henrique",
              quantity: 68096,
            },
            {
              id: "3",
              name: "Riclaudio da  Oficina",
              quantity: 47895,
            },
          ]
            .slice(0, 3)
            .map((buyer, index) => (
              <div
                key={buyer.id}
                className={`flex flex-col items-center justify-center p-2 gap-1 rounded-lg text-center ${
                  index === 0
                    ? "bg-yellow-500 border-2 border-yellow-400 text-foreground"
                    : "bg-foreground/10 opacity-70"
                }`}
              >
                <span className="font-bold text-foreground/70 flex items-center gap-1">
                  {index === 0 ? (
                    <>
                      <Trophy className="w-5 h-5 " />
                      <span className="text-base">#{index + 1}</span>
                    </>
                  ) : (
                    <>
                      <Medal className="w-4 h-4" />
                      <span className="text-sm">#{index + 1}</span>
                    </>
                  )}
                </span>
                <span className="text-sm w-full">{buyer.name}</span>
                <span className="font-bold text-sm">{buyer.quantity} cotas</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TopBuyers;
