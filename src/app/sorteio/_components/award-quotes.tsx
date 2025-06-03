"use client";

import { Flame, ChevronDown } from "lucide-react";
import { useState } from "react";

const AwardQuotes = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-2">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Flame className="w-5 h-5" />
        <h2 className="text-lg font-bold">
          Cotas premiadas <span className="text-sm font-normal">Achou, ganhou!</span>
        </h2>
        <div className="flex items-center p-1 rounded-full bg-foreground/20 animate-pulse">
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="flex flex-row gap-1 items-center flex-wrap">
          {[111111, 222222, 333333, 444444, 555555, 666666, 777777, 888888, 999999].map((number) => (
            <div
              key={number}
              className="bg-green-700 py-1 px-3 rounded-lg text-xs md:text-sm w-fit text-white"
            >
              <span className="font-bold">{number.toString().padStart(6, '0')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AwardQuotes;
