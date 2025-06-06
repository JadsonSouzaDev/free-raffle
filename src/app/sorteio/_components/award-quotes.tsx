"use client";

import { Flame, ChevronDown, CheckCircle, Trophy } from "lucide-react";
import { useState } from "react";

type AwardQuotesProps = {
  awardedQuotes?: {
    id: string;
    referenceNumber: number;
    gift: string;
    user?: {
      whatsapp: string;
      name: string;
    };
  }[];
}

const AwardQuotes = ({ awardedQuotes }: AwardQuotesProps) => {
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
          {awardedQuotes?.map((quote) => (
            <div
              key={quote.id}
              className={`grid grid-cols-3 w-full py-2 px-3 rounded-lg text-sm text-white ${!quote.user ? 'bg-foreground/50' : 'bg-red-700'} items-center`}
            >
              <span className={`flex w-[70px] items-center justify-center px-2 py-1 rounded-lg font-bold ${!quote.user ? 'text-white bg-white/40 ' : 'bg-white text-foreground'}`}>{quote.referenceNumber.toString().padStart(6, '0')}</span>
              <span className="font-normal text-center">{quote.gift}</span>
              <div className="flex items-center justify-end gap-x-2">
                <span className="font-normal text-right">{quote.user?.name ? quote.user.name : 'Disponível'}</span>
                {!quote.user ? <CheckCircle className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AwardQuotes;
