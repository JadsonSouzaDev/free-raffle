export type RaffleAwardQuotesData = {
  id: string;
  raffle_id: string;
  user_id: string;
  reference_number: number;
  created_at: Date;
  updated_at: Date;
  active: boolean;
};

export class RaffleAwardQuotes {
  id!: string;
  userId!: string;
  referenceNumber!: number;
  createdAt!: Date;
  updatedAt!: Date;
  active!: boolean;

  constructor({
    id,
    user_id,
    reference_number,
    created_at,
    updated_at,
    active,
  }: RaffleAwardQuotesData) {
    this.id = id;
    this.userId = user_id;
    this.referenceNumber = reference_number;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
    this.active = active;
  }
}
