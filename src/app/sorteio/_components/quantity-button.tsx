interface SerializedRaffle {
  prices: {
    id: string;
    price: number;
    quantity: number;
  }[];
}

const QuantityButton = ({
  value,
  raffle,
  onClick,
  disabled,
}: {
  disabled: boolean;
  value: number;
  raffle: SerializedRaffle;
  onClick: () => void;
}) => {
  const isMostPopular =
    value === Math.max(...raffle.prices.map((p) => p.quantity));
  return (
    <button
      key={value}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer ${
        isMostPopular
          ? "bg-red-700 border-red-800 border-2 hover:bg-red-800"
          : "bg-foreground border-foreground border-2 hover:bg-foreground/90"
      } text-white px-3 ${
        isMostPopular ? "py-6" : "py-6"
      } rounded-lg transition-colors duration-300 flex flex-col items-center justify-between relative disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isMostPopular && (
        <span className=" w-full text-center bg-red-800 absolute -mt-6 text-[10px] font-bold px-2 py-1 ">
          MAIS POPULAR
        </span>
      )}
      <div className="flex flex-col items-center justify-center">
        <span className="font-bold text-2xl md:text-3xl">+ {value}</span>
        <span className="text-xs md:text-sm">SELECIONAR</span>
      </div>
    </button>
  );
};

export default QuantityButton;
