"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import confetti from "canvas-confetti";
import { drawRaffle } from "@/app/contexts/raffle/raffle.actions";

interface DrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDraw: (number: string) => void;
  raffleId: string;
}

// Lista de nomes para a animação
const NAMES = [
  "Maria Silva",
  "João Santos",
  "Ana Oliveira",
  "Pedro Costa",
  "Lucas Pereira",
  "Julia Lima",
  "Gabriel Souza",
  "Beatriz Alves",
  "Rafael Santos",
  "Mariana Costa",
  "Thiago Lima",
  "Carolina Silva",
  "Bruno Oliveira",
  "Fernanda Santos",
  "Diego Costa",
  "Amanda Lima",
  "Felipe Souza",
  "Larissa Silva",
  "Gustavo Santos",
  "Isabela Costa",
];

export function DrawModal({
  isOpen,
  onClose,
  onDraw,
  raffleId,
}: DrawModalProps) {
  const [drawNumber, setDrawNumber] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getRandomName = () => {
    return NAMES[Math.floor(Math.random() * NAMES.length)];
  };

  const fireConfetti = () => {
    // Dispara confete dos cantos
    const count = 400;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Cores em tons de vermelho e dourado
    const redColors = ["#FF0000", "#FF1744", "#FF4081", "#FF5252", "#FF8A80"];
    const goldColors = ["#FFD700", "#FFA500", "#DAA520", "#B8860B", "#FFB300"];

    // Lado esquerdo - Vermelho
    fire(0.2, {
      spread: 60,
      startVelocity: 65,
      origin: { x: 0 },
      colors: redColors,
    });

    // Lado direito - Dourado
    fire(0.2, {
      spread: 60,
      startVelocity: 65,
      origin: { x: 1 },
      colors: goldColors,
    });

    // Centro-esquerda - Dourado
    fire(0.15, {
      spread: 50,
      startVelocity: 55,
      origin: { x: 0.3 },
      colors: goldColors,
    });

    // Centro - Mix
    fire(0.3, {
      spread: 80,
      decay: 0.91,
      scalar: 1,
      origin: { x: 0.5 },
      colors: [...redColors, ...goldColors],
    });

    // Centro-direita - Vermelho
    fire(0.15, {
      spread: 50,
      startVelocity: 55,
      origin: { x: 0.7 },
      colors: redColors,
    });

    // Disparo adicional após um pequeno delay para criar um efeito mais duradouro
    setTimeout(() => {
      // Lado esquerdo - Dourado
      fire(0.15, {
        spread: 70,
        startVelocity: 45,
        origin: { x: 0.2 },
        colors: goldColors,
      });

      // Centro - Mix
      fire(0.15, {
        spread: 70,
        startVelocity: 45,
        origin: { x: 0.5 },
        colors: [...redColors, ...goldColors],
      });

      // Lado direito - Vermelho
      fire(0.15, {
        spread: 70,
        startVelocity: 45,
        origin: { x: 0.8 },
        colors: redColors,
      });
    }, 200);

    // Último disparo para finalizar com ainda mais intensidade
    setTimeout(() => {
      // Explosão final com mix de cores
      fire(0.2, {
        spread: 120,
        startVelocity: 45,
        decay: 0.92,
        scalar: 1.2,
        origin: { x: 0.5 },
        colors: [...goldColors, ...redColors],
      });

      // Chuva dourada suave
      fire(0.15, {
        spread: 140,
        startVelocity: 35,
        decay: 0.94,
        scalar: 0.8,
        ticks: 300,
        origin: { x: 0.5, y: 0.5 },
        colors: goldColors,
      });
    }, 400);
  };

  const animate = (startTime: number, duration: number, result: {
    id: string;
    whatsapp: string;
    name: string;
  }) => {
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Efeito de desaceleração
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const speed = easeOut(1 - progress);

    // Quanto menor o progresso, mais rápido os nomes mudam
    if (progress < 1) {
      setDisplayName(getRandomName());
      const nextFrameDelay = 50 + (1 - speed) * 200; // Começa rápido e vai desacelerando
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(() => animate(startTime, duration, result), nextFrameDelay);
      });
    } else {
      // No final, mostra o vencedor
      setDisplayName(result?.name || "Algum vencedor");
      setIsDrawing(false);
      fireConfetti();
    }
  };

  const handleClose = () => {
    onDraw(drawNumber);
    setDrawNumber("");
    setDisplayName("");
    setIsDrawing(false);
    onClose();
  };

  const handleDraw = async () => {
    try {
      if (!drawNumber || drawNumber.length !== 6) {
        alert("Por favor, insira um número válido com 6 dígitos");
        return;
      }

      const result = await drawRaffle(raffleId, drawNumber);

      setDisplayName(getRandomName());
      setIsDrawing(true);
      animate(performance.now(), 3000, result); // 3 segundos de animação
    } catch (error) {
      console.error(error);
      alert("Ninguém foi sorteado");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const newDrawNumber = drawNumber.split("");
    newDrawNumber[index] = value.slice(-1);
    const nextInput =
      e.target.parentElement?.nextElementSibling?.querySelector("input");

    if (nextInput && value) {
      nextInput.focus();
    }

    setDrawNumber(newDrawNumber.join(""));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      // Se o input atual está vazio, move para o anterior
      if (!drawNumber[index]) {
        const prevInput =
          e.currentTarget.parentElement?.previousElementSibling?.querySelector(
            "input"
          );
        if (prevInput) {
          prevInput.focus();
          const newDrawNumber = drawNumber.split("");
          newDrawNumber[index - 1] = "";
          setDrawNumber(newDrawNumber.join(""));
        }
      } else {
        // Se o input atual tem valor, apenas apaga o valor
        const newDrawNumber = drawNumber.split("");
        newDrawNumber[index] = "";
        setDrawNumber(newDrawNumber.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setDrawNumber(pastedData.padEnd(6, ""));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md text-foreground">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Realizar Sorteio</h2>
          {!isDrawing && (
            <button
              onClick={handleClose}
              className="cursor-pointer text-foreground hover:text-foreground/80"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between py-4 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-12 h-14">
                  <input
                    ref={index === 0 ? firstInputRef : null}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={drawNumber[index] || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-full h-full text-center text-2xl font-bold bg-foreground/10 border-2 border-foreground/20 rounded-lg focus:outline-none focus:border-foreground/40"
                    disabled={isDrawing}
                  />
                </div>
              ))}
            </div>
          </div>

          {isDrawing && (
            <div className="py-4 border-t border-foreground/10">
              <div className="flex justify-center">
                <div className="animate-pulse">
                  <div className="px-8 py-4 bg-foreground/10 rounded-lg">
                    <p className="text-xl font-bold text-center">
                      {displayName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isDrawing && displayName && (
            <div className="py-4 border-t border-foreground/10">
              <div className="flex justify-center">
                <div className="px-8 py-4 bg-yellow-500/10 rounded-lg border-2 border-yellow-500/20">
                  <p className="text-xl font-bold text-center text-yellow-500">
                    {displayName}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {!isDrawing && displayName ? (
              <button
                onClick={handleClose}
                className="cursor-pointer text-sm font-bold text-white px-4 py-2 bg-yellow-500 hover:bg-yellow-600/90 rounded-lg transition-colors"
              >
                Fechar
              </button>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  className="cursor-pointer text-sm font-bold px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isDrawing}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDraw}
                  className="cursor-pointer text-sm font-bold text-white px-4 py-2 bg-yellow-500 hover:bg-yellow-600/90 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isDrawing}
                >
                  {isDrawing ? "Sorteando..." : "Sortear"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
