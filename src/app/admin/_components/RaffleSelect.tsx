"use client";

import { getRafflesSelectOptions } from "@/app/contexts/raffle/raffle.actions";
import useSWR from "swr";

const RaffleSelect = ({
  onChange,
}: {
  onChange: (value: string) => void;
}) => {
  const { data: raffles, isLoading } = useSWR(
    "/api/raffles",
    getRafflesSelectOptions
  );
  
  return (
    <div className="flex-1 text-sm">
      <label htmlFor="raffle" className="block mb-2">
        Sorteio
      </label>
      <select
        disabled={isLoading}
        className="cursor-pointer p-2 rounded-lg border border-gray-300 focus:outline-none w-full"
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" className="cursor-pointer">
          Todos
        </option>
        {raffles?.map((raffle) => (
          <option
            key={raffle.id}
            value={raffle.id}
            className="cursor-pointer truncate"
          >
            {raffle.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RaffleSelect;
