"use client";

import { X } from "lucide-react";
import { FileUpload } from "@/app/components/FileUpload";
import Image from "next/image";
import { updateUserPhoto } from "@/app/contexts/user/user.actions";
import { useState } from "react";

interface User {
  whatsapp: string;
  name: string;
  imgUrl?: string;
}

interface UserPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserPhotoModal({ isOpen, onClose, user }: UserPhotoModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !user) return null;

  const handlePhotoUpload = async (url: string) => {
    try {
      setIsUpdating(true);
      await updateUserPhoto(user.whatsapp, url);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar foto:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl py-4 md:py-6 w-full max-w-md text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8 px-4 md:px-6">
          <h2 className="text-xl font-bold">Foto do Usuário</h2>
          <button
            onClick={onClose}
            className="text-foreground cursor-pointer hover:text-foreground/80"
            disabled={isUpdating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 px-4 md:px-6">
          <div className="flex flex-col items-center gap-4">
            {user.imgUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                <Image
                  src={user.imgUrl}
                  alt={`Foto de ${user.name}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              {user.imgUrl ? "Alterar foto" : "Adicione uma foto"}
            </span>
          </div>

          <FileUpload
            path="/users"
            onUploadComplete={handlePhotoUpload}
          />
        </div>
      </div>
    </div>
  );
} 