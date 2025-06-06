'use server'

import { put } from '@vercel/blob';

type UploadResponse = {
  url: string;
  success: boolean;
  error?: string;
}

export async function uploadFile(
  formData: FormData
): Promise<UploadResponse> {
  try {
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return {
        url: '',
        success: false,
        error: 'Nenhum arquivo foi enviado'
      };
    }

    if (!path) {
      return {
        url: '',
        success: false,
        error: 'O caminho (path) é obrigatório'
      };
    }

    // Validar se o path é permitido
    const allowedPaths = ['/raffles', '/users'];
    if (!allowedPaths.includes(path)) {
      return {
        url: '',
        success: false,
        error: 'Caminho não permitido'
      };
    }

    // Gerar um nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${path.replace('/', '')}/${timestamp}-${file.name}`;

    // Fazer upload do arquivo para o Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    return {
      url: blob.url,
      success: true
    };

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return {
      url: '',
      success: false,
      error: 'Erro ao processar o upload'
    };
  }
} 