'use client'

import { useState } from 'react';
import { uploadFile } from '../contexts/upload/upload';

type FileUploadProps = {
  path: '/raffles' | '/users';
  onUploadComplete?: (url: string) => void;
}

export function FileUpload({ path, onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      const result = await uploadFile(formData);
      
      if (result.success && result.url) {
        onUploadComplete?.(result.url);
        // Limpa o input após o upload bem sucedido
        event.target.value = '';
      } else {
        setError(result.error || 'Erro ao fazer upload');
      }
    } catch {
      setError('Erro ao processar o upload');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:cursor-pointer
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-red-50 file:text-red-700
            hover:file:bg-red-100
            disabled:opacity-50"
        />
      </div>

      {isUploading && (
        <p className="text-sm text-red-600">Enviando arquivo...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 