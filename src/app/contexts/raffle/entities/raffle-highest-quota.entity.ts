export type RaffleHighestQuotaData = {
  whatsapp: string;
  name: string;
  reference_number: number;
};

export class RaffleHighestQuota {
  whatsapp: string;
  name: string;
  referenceNumber: number;

  constructor(data: RaffleHighestQuotaData) {
    this.whatsapp = data.whatsapp;
    this.name = data.name;
    this.referenceNumber = data.reference_number;
  }
}
