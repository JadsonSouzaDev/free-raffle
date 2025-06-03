import { RaffleAwardQuotes, RafflePrice, RaffleTopBuyer } from "./";

export type RaffleData = {
  id: string;
  title: string;
  images_urls: string[];
  description: string;
  main_winner_id?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export class Raffle {
  id!: string;
  title!: string;
  imagesUrls!: string[];
  description!: string;
  mainWinnerId?: string;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  prices!: RafflePrice[];
  awardedQuotes?: RaffleAwardQuotes[];
  topQuotes?:
    | {
        user_id: string;
        quantity: number;
      }[]
    | null;
  topBuyers?: RaffleTopBuyer[];

  constructor(data: RaffleData) {
    this.id = data.id;
    this.title = data.title;
    this.imagesUrls = data.images_urls;
    this.description = data.description;
    this.active = data.active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.mainWinnerId = data.main_winner_id;
  }

  setPrices(prices: RafflePrice[]) {
    this.prices = prices;
  }

  setAwardedQuotes(awarded_quotes: RaffleAwardQuotes[]) {
    this.awardedQuotes = awarded_quotes;
  }

  setTopBuyers(top_buyers: RaffleTopBuyer[]) {
    this.topBuyers = top_buyers;
  }

  get status(): "active" | "finished" {
    if (this.mainWinnerId) {
      return "finished";
    }
    return "active";
  }
}
