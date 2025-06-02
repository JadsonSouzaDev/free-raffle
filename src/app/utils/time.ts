export const formatTimeRemaining = (createdAt: string, currentTime: number = Date.now()) => {
  const createdDate = new Date(createdAt);
  const timeDiff = currentTime - createdDate.getTime();
  const timeRemaining = 5 * 60 * 1000 - timeDiff; // 5 minutos em milissegundos
  
  if (timeRemaining <= 0) {
    return "Tempo esgotado";
  }

  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};