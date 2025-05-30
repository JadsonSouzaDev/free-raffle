export type RafflePriceData = {
  id: string;
  raffle_id: string;
  price: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  active: boolean;
};

export class RafflePrice {
  id!: string;
  price!: number;
  quantity!: number;
  createdAt!: Date;
  updatedAt!: Date;
  active!: boolean;

  constructor({
    id,
    price,
    quantity,
    created_at,
    updated_at,
    active,
  }: RafflePriceData) {
    this.id = id;
    this.price = Number(price);
    this.quantity = quantity;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
    this.active = active;
  }
}
