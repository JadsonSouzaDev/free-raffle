export type RaffleTopBuyerData = {
  whatsapp: string;
  name: string;
  total: number;
};

export class RaffleTopBuyer {
  whatsapp: string;
  name: string;
  total: number;

  constructor({ whatsapp, name, total }: RaffleTopBuyerData) {
    this.whatsapp = whatsapp;
    this.name = name;
    this.total = total;
  }
}