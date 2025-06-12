export type RaffleAwardQuotesData = {
  id: string;
  raffle_id: string;
  user_id: string;
  user_name: string;
  reference_number: number;
  show_winner: boolean; 
  gift: string;
  created_at: Date;
  updated_at: Date;
  active: boolean;
};

export class RaffleAwardQuotes {
  id!: string;
  user?: {
    whatsapp: string;
    name: string;
  };
  showWinner!: boolean;
  referenceNumber!: number;
  gift!: string;
  createdAt!: Date;
  updatedAt!: Date;
  active!: boolean;

  constructor({
    id,
    user_id,
    user_name,
    reference_number,
    gift,
    created_at,
    updated_at,
    active,
    show_winner
  }: RaffleAwardQuotesData) {
    this.id = id;
    this.user = user_id && user_name ? {
      whatsapp: user_id,
      name: user_name,
    } : undefined;
    this.referenceNumber = reference_number;
    this.gift = gift;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
    this.active = active;
    this.showWinner = show_winner;
  }
}
