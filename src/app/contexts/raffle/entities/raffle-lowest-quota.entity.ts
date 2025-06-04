export type RaffleLowestQuotaData = {
  whatsapp: string;
  name: string;
  reference_number: number;
};

export class RaffleLowestQuota {
  whatsapp: string;
  name: string;
  referenceNumber: number;

  constructor(data: RaffleLowestQuotaData) {
    this.whatsapp = data.whatsapp;
    this.name = data.name;
    this.referenceNumber = data.reference_number;
  }
}
