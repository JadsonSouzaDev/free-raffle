export function formatWhatsApp(telephone) {
  if (!telephone) return null;
  
  // Remove todos os caracteres não numéricos
  const numbers = telephone.replace(/\D/g, '');
  
  // Se o número não tiver a quantidade correta de dígitos após a limpeza, retorna null
  if (numbers.length !== 11) {
    return null;
  }
  
  // Adiciona o código do país (+55) e verifica o total de dígitos
  const withCountryCode = '55' + numbers;
  
  return '+' + withCountryCode;
}

export function isValidWhatsApp(whatsapp) {
  if (!whatsapp) return false;
  
  // Remove todos os caracteres não numéricos, exceto o +
  const cleaned = whatsapp.replace(/[^\d+]/g, '');
  
  // Verifica se começa com + e tem exatamente 14 caracteres (+55 + 11 dígitos)
  if (!cleaned.startsWith('+')) return false;
  
  return cleaned.length === 14;
} 