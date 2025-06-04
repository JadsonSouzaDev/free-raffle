import { Copy } from "lucide-react";
import { useState } from "react";

const CopyText = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-row gap-1 items-center">
      <span className={`${isCopied ? "font-bold" : "font-normal"}`}>
        {isCopied ? "Copiado" : text}
      </span>
      {!isCopied && (
        <button className="cursor-pointer" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default CopyText;