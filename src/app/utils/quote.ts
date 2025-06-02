export function getQuotes(quantity: number, maxNumber: number, exclude: number[] = []): number[] {
  const numbers = new Set<number>();

  while (numbers.size < quantity) {
    const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
    if (!exclude.includes(randomNumber)) {
      numbers.add(randomNumber);
    }
  }

  return Array.from(numbers);
}

export function getQuote(maxNumber: number, exclude: number[]): number {
  const quotes = getQuotes(1, maxNumber, exclude);
  return quotes[0];
}
