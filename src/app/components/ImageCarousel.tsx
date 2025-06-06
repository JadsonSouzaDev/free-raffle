"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Muda a imagem a cada 5 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative w-full h-[230px] md:h-[320px]">
        <Image
          src={images[0]}
          alt={title}
          fill
          priority
          className="rounded-sm object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[230px] md:h-[320px] overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute w-full h-full transition-opacity duration-500 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`${title} - Imagem ${index + 1}`}
            fill
            priority={index === 0}
            className="rounded-sm object-cover"
          />
        </div>
      ))}
      
      {/* Indicadores de navegação */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentImageIndex
                ? "bg-white scale-125"
                : "bg-white/50"
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
} 