export type RaffleFlagData = {
  id: string;
  flag_top_buyers: boolean;
  flag_top_buyers_week: boolean;
  flag_top_buyers_day: boolean;
  flag_lowest_quota: boolean;
  flag_highest_quota: boolean;
};

export class RaffleFlag {
  id!: string;
  flagTopBuyers!: boolean;
  flagTopBuyersWeek!: boolean;
  flagTopBuyersDay!: boolean;
  flagLowestQuota!: boolean;
  flagHighestQuota!: boolean;

  constructor(data: RaffleFlagData) {
    this.id = data.id;
    this.flagTopBuyers = data.flag_top_buyers;
    this.flagTopBuyersWeek = data.flag_top_buyers_week;
    this.flagTopBuyersDay = data.flag_top_buyers_day;
    this.flagLowestQuota = data.flag_lowest_quota;
    this.flagHighestQuota = data.flag_highest_quota;
  }
}
