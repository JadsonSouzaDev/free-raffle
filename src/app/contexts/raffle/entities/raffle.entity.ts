import { RaffleAwardQuotes, RafflePrice, RaffleTopBuyer, RaffleFlag } from "./";
import { RaffleHighestQuota } from "./raffle-highest-quota.entity";
import { RaffleLowestQuota } from "./raffle-lowest-quota.entity";

export type RaffleData = {
  id: string;
  title: string;
  images_urls: string[];
  description: string;
  winner_quota_id?: string;
  pre_quantity_numbers: number[];
  active: boolean;
  hidden: boolean;
  created_at: Date;
  updated_at: Date;
};

export class Raffle {
  id!: string;
  title!: string;
  imagesUrls!: string[];
  description!: string;
  winnerQuotaId?: string;
  preQuantityNumbers!: number[];
  active!: boolean;
  hidden!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  prices!: RafflePrice[];
  awardedQuotes?: RaffleAwardQuotes[];
  topBuyers?: RaffleTopBuyer[];
  topBuyersWeek?: RaffleTopBuyer[];
  topBuyersDay?: RaffleTopBuyer[];
  lowestQuota?: RaffleLowestQuota;
  highestQuota?: RaffleHighestQuota;
  quotasSold?: number;
  flags!: RaffleFlag;
  progress!: number;
  constructor(data: RaffleData) {
    this.id = data.id;
    this.title = data.title;
    this.imagesUrls = data.images_urls[0].split(",");
    this.description = data.description;
    this.preQuantityNumbers = data.pre_quantity_numbers;
    this.active = data.active;
    this.hidden = data.hidden;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.winnerQuotaId = data.winner_quota_id;
    this.quotasSold = 0;
    this.progress = 0;
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

  setTopBuyersWeek(top_buyer_week: RaffleTopBuyer[]) {
    this.topBuyersWeek = top_buyer_week;
  }

  setTopBuyersDay(top_buyer_day: RaffleTopBuyer[]) {
    this.topBuyersDay = top_buyer_day;
  }

  setLowestQuota(lowest_quota: RaffleLowestQuota) {
    this.lowestQuota = lowest_quota;
  }

  setHighestQuota(highest_quota: RaffleHighestQuota) {
    this.highestQuota = highest_quota;
  }

  setQuotasSold(quotas_sold: number) {
    this.quotasSold = quotas_sold;
  }

  setFlags(flags: RaffleFlag) {
    this.flags = flags;
  }

  setProgress(progress: number) {
    this.progress = progress;
  }

  get status(): "active" | "finished" {
    if (this.winnerQuotaId) {
      return "finished";
    }
    return "active";
  }
}
