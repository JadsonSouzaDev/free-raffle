"use server";
import { neon } from "@neondatabase/serverless";
import {
  Raffle,
  RaffleAwardQuotes,
  RaffleAwardQuotesData,
  RaffleData,
  RaffleFlag,
  RaffleFlagData,
  RafflePrice,
  RafflePriceData,
  RaffleTopBuyer,
  RaffleTopBuyerData,
} from "./entities";
import { getEndOfDay, getStartOfDay, getStartOfWeek } from "@/app/utils/date";
import { getEndOfWeek } from "@/app/utils/date";
import { RaffleHighestQuota, RaffleHighestQuotaData } from "./entities/raffle-highest-quota.entity";
import { RaffleLowestQuota, RaffleLowestQuotaData } from "./entities/raffle-lowest-quota.entity";
import { CreateRaffleFormData } from "@/app/admin/_components/CreateRaffleModal";

export type RaffleResponse = {
  id: string;
  title: string;
  description: string;
  imagesUrls: string[];
  preQuantityNumbers: number[];
  minQuantity: number;
  maxQuantity: number;
  prices: Array<{
    id: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
  }>;
  awardedQuotes: Array<{
    id: string;
    referenceNumber: number;
    gift: string;
    user?: {
      whatsapp: string;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
  }>;
  topBuyers: Array<{
    whatsapp: string;
    name: string;
    total: number;
  }>;
  topBuyersWeek: Array<{
    whatsapp: string;
    name: string;
    total: number;
  }>;
  topBuyersDay: Array<{
    whatsapp: string;
    name: string;
    total: number;
  }>;
  highestQuota?: {
    whatsapp: string;
    name: string;
    referenceNumber: number;
  };
  lowestQuota?: {
    whatsapp: string;
    name: string;
    referenceNumber: number;
  };
  flags: {
    flagTopBuyers: boolean;
    flagTopBuyersWeek: boolean;
    flagTopBuyersDay: boolean;
    flagLowestQuota: boolean;
    flagHighestQuota: boolean;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  quotasSold: number;
}

export async function createRaffle(formData: CreateRaffleFormData) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // create raffle
  const title = formData.title
  const images_urls = formData.imagesUrls.join(",");
  const description = formData.description;
  const preQuantityNumbers = formData.preQuantityNumbers;
  const minQuantity = formData.minQuantity;
  const maxQuantity = formData.maxQuantity;
  const result =
    (await sql`INSERT INTO raffles (title, images_urls, description, pre_quantity_numbers, min_quantity, max_quantity) VALUES (${title}, ARRAY[${images_urls}], ${description}, ${preQuantityNumbers}, ${minQuantity}, ${maxQuantity}) RETURNING id`) as unknown as {
      id: string;
    }[];
  const raffle_id = result[0].id;

  // create flags
  await sql`INSERT INTO raffles_flags (id) VALUES (${raffle_id})`;

  // create prices
  const prices = formData.prices;
  for (const price of prices) {
    await sql`INSERT INTO raffles_prices (raffle_id, price, quantity) VALUES (${raffle_id}, ${price.pricePerUnit}, ${price.quantity})`;
  }
  // create awarded quotes
  const awarded_quotes = formData.awardedNumbers;
  if (awarded_quotes) {
    for (const awarded_quote of awarded_quotes) {
      await sql`INSERT INTO raffles_awarded_quotes (raffle_id, reference_number, gift) VALUES (${raffle_id}, ${awarded_quote.reference_number}, ${awarded_quote.award})`;
    }
  }
}

export async function getRaffles(): Promise<Raffle[]> {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffles
  const rawRaffles =
    await sql`SELECT * FROM raffles WHERE active = true ORDER BY created_at DESC`;
  const raffles: Raffle[] = rawRaffles.map(
    (raffle) => new Raffle(raffle as unknown as RaffleData)
  );

  for (const raffle of raffles) {
    // get prices
    const prices =
      await sql`SELECT * FROM raffles_prices WHERE raffle_id = ${raffle.id}`;
    raffle.setPrices(
      prices.map(
        (price) => new RafflePrice(price as unknown as RafflePriceData)
      )
    );

    // get awarded quotes
    const rawAwardedQuotes =
      await sql`SELECT * FROM raffles_awarded_quotes WHERE raffle_id = ${raffle.id}`;
    raffle.setAwardedQuotes(
      rawAwardedQuotes.map(
        (quote) =>
          new RaffleAwardQuotes(quote as unknown as RaffleAwardQuotesData)
      )
    );

    // get quotas sold
    const quotasSold =
      await sql`SELECT COUNT(*) FROM quotas WHERE raffle_id = ${raffle.id}`;
    raffle.setQuotasSold(quotasSold[0].count);

    // get flags
    const flags =
      await sql`SELECT * FROM raffles_flags WHERE id = ${raffle.id}`;
    raffle.setFlags(new RaffleFlag(flags[0] as unknown as RaffleFlagData));
  }

  return raffles;
}

export async function getRaffleById(id: string): Promise<RaffleResponse>{
  const raffle = await getRaffle(id);
  return {
    id: raffle.id,
    title: raffle.title,
    description: raffle.description,
    imagesUrls: raffle.imagesUrls,
    preQuantityNumbers: raffle.preQuantityNumbers,
    minQuantity: raffle.minQuantity,
    maxQuantity: raffle.maxQuantity,
    prices: raffle.prices.map(price => ({
      id: price.id,
      price: price.price,
      quantity: price.quantity,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
      active: price.active,
    })),
    awardedQuotes: (raffle.awardedQuotes ?? []).map(quote => ({
      id: quote.id,
      referenceNumber: quote.referenceNumber,
      gift: quote.gift,
      userId: quote.user?.whatsapp,
      userName: quote.user?.name,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      active: quote.active,
    })),
    topBuyers: (raffle.topBuyers ?? []).map(buyer => ({
      whatsapp: buyer.whatsapp,
      name: buyer.name,
      total: buyer.total,
    })),
    topBuyersWeek: (raffle.topBuyersWeek ?? []).map(buyer => ({
      whatsapp: buyer.whatsapp,
      name: buyer.name,
      total: buyer.total,
    })),
    topBuyersDay: (raffle.topBuyersDay ?? []).map(buyer => ({
      whatsapp: buyer.whatsapp,
      name: buyer.name,
      total: buyer.total,
    })),
    highestQuota: raffle.highestQuota ? {
      whatsapp: raffle.highestQuota.whatsapp,
      name: raffle.highestQuota.name,
      referenceNumber: raffle.highestQuota.referenceNumber,
    } : undefined,
    lowestQuota: raffle.lowestQuota ? {
      whatsapp: raffle.lowestQuota.whatsapp,
      name: raffle.lowestQuota.name,
      referenceNumber: raffle.lowestQuota.referenceNumber,
    } : undefined,
    flags: {
      flagTopBuyers: raffle.flags.flagTopBuyers,
      flagTopBuyersWeek: raffle.flags.flagTopBuyersWeek,
      flagTopBuyersDay: raffle.flags.flagTopBuyersDay,
      flagLowestQuota: raffle.flags.flagLowestQuota,
      flagHighestQuota: raffle.flags.flagHighestQuota,
    },
    status: raffle.status,
    createdAt: raffle.createdAt,
    updatedAt: raffle.updatedAt,
    active: raffle.active,
    quotasSold: raffle.quotasSold ?? 0,
  }
}

export async function getRaffle(id: string): Promise<Raffle> {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffle
  const rawRaffle =
    await sql`SELECT * FROM raffles WHERE id = ${id} AND active = true`;
  if (rawRaffle.length === 0) {
    throw new Error("Raffle not found");
  }
  const raffle = new Raffle(rawRaffle[0] as unknown as RaffleData);



  // get prices
  const prices =
    await sql`SELECT * FROM raffles_prices WHERE raffle_id = ${raffle.id}`;
  raffle.setPrices(
    prices.map((price) => new RafflePrice(price as unknown as RafflePriceData))
  );

  // get awarded quotes
  const rawAwardedQuotes = await sql`SELECT raq.*, u.name as user_name 
  FROM raffles_awarded_quotes raq LEFT JOIN users u on raq.user_id = u.whatsapp 
  WHERE raq.raffle_id = ${raffle.id} and raq.active = true 
  ORDER BY raq.reference_number ASC`;
  raffle.setAwardedQuotes(
    rawAwardedQuotes.map(
      (quote) =>
        new RaffleAwardQuotes(quote as unknown as RaffleAwardQuotesData)
    )
  );

  const baseQuery = (
    startDate?: string,
    endDate?: string
  ) => sql`SELECT u.whatsapp, u.name, COUNT(q.id) as total 
  from quotas q join orders o on q.order_id = o.id join users u on o.user_id = u.whatsapp 
  where q.raffle_id = ${raffle.id} 
  ${startDate ? sql`and q.created_at >= ${startDate}` : sql``} 
  ${endDate ? sql`and q.created_at <= ${endDate}` : sql``}
  group by u.whatsapp, u."name" order by total desc limit 3`;

  const topBuyers = await baseQuery();
  const topBuyersWeek = await baseQuery(getStartOfWeek(), getEndOfWeek());
  const topBuyersDay = await baseQuery(getStartOfDay(), getEndOfDay());

  raffle.setTopBuyers(
    topBuyers.map(
      (buyer) => new RaffleTopBuyer(buyer as unknown as RaffleTopBuyerData)
    )
  );
  raffle.setTopBuyersWeek(
    topBuyersWeek.map(
      (buyer) => new RaffleTopBuyer(buyer as unknown as RaffleTopBuyerData)
    )
  );
  raffle.setTopBuyersDay(
    topBuyersDay.map(
      (buyer) => new RaffleTopBuyer(buyer as unknown as RaffleTopBuyerData)
    )
  );

  // get highest quota
  const highestQuota =
    await sql`SELECT u.whatsapp, u.name, q.serial_number as reference_number
    FROM quotas q 
    join orders o on q.order_id = o.id
    join users u on o.user_id = u.whatsapp 
  WHERE q.raffle_id = ${raffle.id} ORDER BY q.serial_number DESC LIMIT 1`;

  if (highestQuota.length > 0) {
    raffle.setHighestQuota(
      new RaffleHighestQuota(highestQuota[0] as unknown as RaffleHighestQuotaData)
    );
  }

  // get lowest quota
  const lowestQuota =
    await sql`SELECT u.whatsapp, u.name, q.serial_number as reference_number
    FROM quotas q 
    join orders o on q.order_id = o.id
    join users u on o.user_id = u.whatsapp 
  WHERE q.raffle_id = ${raffle.id} ORDER BY q.serial_number ASC LIMIT 1`;

  if (lowestQuota.length > 0) {
    raffle.setLowestQuota(new RaffleLowestQuota(lowestQuota[0] as unknown as RaffleLowestQuotaData));
  }

  // get flags
  const flags = await sql`SELECT * FROM raffles_flags WHERE id = ${raffle.id}`;
  raffle.setFlags(new RaffleFlag(flags[0] as unknown as RaffleFlagData));

  // get progress
  const countResult = await sql`SELECT COUNT(*) FROM quotas WHERE raffle_id = ${raffle.id}`;
  const quotasSold = countResult[0].count || 0;
  const MAX_SOLDED_QUOTAS = 999999;
  const progress = (quotasSold / MAX_SOLDED_QUOTAS) * 100;
  raffle.setProgress(progress);

  // if max quantity is greater than the number of solded quotas, set max quantity to the number of solded quotas
  if(raffle.maxQuantity > MAX_SOLDED_QUOTAS - quotasSold) {
    raffle.setMaxQuantity(MAX_SOLDED_QUOTAS - quotasSold);
  }

  return raffle;
}

export async function getRafflesSelectOptions(): Promise<
  { id: string; title: string }[]
> {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffles
  const rawRaffles =
    await sql`SELECT id, title FROM raffles WHERE active = true ORDER BY created_at DESC`;
  return rawRaffles.map((raffle) => ({ id: raffle.id, title: raffle.title }));
}

export type UpdateRaffleFormData = Omit<CreateRaffleFormData, 'prices' | 'awardedNumbers'> & {
  prices: Array<{
    id?: string;
    quantity: number;
    pricePerUnit: number;
  }>;
  awardedNumbers: Array<{
    id?: string;
    reference_number: number;
    award: string;
  }>;
};

export async function updateRaffle(raffleId: string, formData: UpdateRaffleFormData) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // update raffle
  const title = formData.title;
  const images_urls = formData.imagesUrls.join(",");
  const description = formData.description;
  const preQuantityNumbers = formData.preQuantityNumbers;
  const minQuantity = formData.minQuantity;
  const maxQuantity = formData.maxQuantity;
  await sql`UPDATE raffles SET title = ${title}, images_urls = ARRAY[${images_urls}], description = ${description}, pre_quantity_numbers = ${preQuantityNumbers}, min_quantity = ${minQuantity}, max_quantity = ${maxQuantity} WHERE id = ${raffleId}`;

  // get existing prices and awarded quotes
  const existingPrices = await sql`SELECT id, quantity FROM raffles_prices WHERE raffle_id = ${raffleId} AND active = true`;
  const existingAwardedQuotes = await sql`SELECT id, reference_number FROM raffles_awarded_quotes WHERE raffle_id = ${raffleId} AND active = true`;

  // update prices
  const prices = formData.prices;
  const existingPriceIds = existingPrices.map(p => p.id);
  const newPriceIds = prices.filter(p => p.id).map(p => p.id as string);
  
  // Desativa preços que não estão mais presentes no formData
  const pricesToDeactivate = existingPriceIds.filter(id => !newPriceIds.includes(id));
  if (pricesToDeactivate.length > 0) {
    await sql`UPDATE raffles_prices SET active = false WHERE raffle_id = ${raffleId} AND id = ANY(${pricesToDeactivate})`;
  }
  
  // Atualiza ou cria novos preços
  for (const price of prices) {
    if (price.id) {
      await sql`UPDATE raffles_prices SET quantity = ${price.quantity}, price = ${price.pricePerUnit} WHERE id = ${price.id}`;
    } else {
      await sql`INSERT INTO raffles_prices (raffle_id, price, quantity) VALUES (${raffleId}, ${price.pricePerUnit}, ${price.quantity})`;
    }
  }

  // update awarded quotes
  const awardedQuotes = formData.awardedNumbers;
  const existingAwardedQuoteIds = existingAwardedQuotes.map(q => q.id);
  const newAwardedQuoteIds = awardedQuotes.filter(q => q.id).map(q => q.id as string);

  // Desativa cotas premiadas que não estão mais presentes no formData
  const quotesToDeactivate = existingAwardedQuoteIds.filter(id => !newAwardedQuoteIds.includes(id));
  if (quotesToDeactivate.length > 0) {
    await sql`UPDATE raffles_awarded_quotes SET active = false WHERE raffle_id = ${raffleId} AND id = ANY(${quotesToDeactivate})`;
  }

  // Atualiza ou cria novas cotas premiadas
  for (const quote of awardedQuotes) {
    if (quote.id) {
      await sql`UPDATE raffles_awarded_quotes SET reference_number = ${quote.reference_number}, gift = ${quote.award} WHERE id = ${quote.id}`;
    } else {
      const result = await sql`INSERT INTO raffles_awarded_quotes (raffle_id, reference_number, gift) VALUES (${raffleId}, ${quote.reference_number}, ${quote.award}) RETURNING id`;
      const awardedQuoteId = result[0].id;
      // Verifica se a cota premiada já foi comprada
      const quota = await sql`SELECT id FROM quotas WHERE raffle_id = ${raffleId} AND serial_number = ${quote.reference_number} limit 1`;
      if (quota.length > 0) {
        await sql`UPDATE quotas SET raffle_awarded_quote_id = ${awardedQuoteId} WHERE id = ${quota[0].id}`;
      }
    }
  }
}

export async function drawRaffle(raffleId: string, number: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffle
  const raffleResult = await sql`SELECT id FROM raffles WHERE id = ${raffleId} AND active = true limit 1` as RaffleData[];

  if (raffleResult.length === 0) {
    throw new Error("Raffle not found");
  }

  if (raffleResult[0].winner_quota_id) {
    throw new Error("Raffle is not active");
  }

  // get quotas
  const quota = await sql`SELECT q.id, u.whatsapp, u.name 
    FROM quotas q 
    join orders o on q.order_id = o.id 
    join users u on o.user_id = u.whatsapp 
    WHERE q.raffle_id = ${raffleId} AND q.serial_number = ${number} limit 1`;

  if (quota.length === 0) {
    throw new Error("Quota not found");
  }

  // update raffle
  await sql`UPDATE raffles SET winner_quota_id = ${quota[0].id} WHERE id = ${raffleId}`;

  const quotaData = quota[0] as unknown as {
    id: string;
    whatsapp: string;
    name: string;
  };

  return quotaData;
}

export async function getRaffleWinner(raffleId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffle
  const raffleResult = await sql`SELECT q.serial_number, u.whatsapp, u.name 
    FROM quotas q 
    join raffles r on q.raffle_id = r.id
    join orders o on q.order_id = o.id 
    join users u on o.user_id = u.whatsapp 
    WHERE r.id = ${raffleId} AND r.winner_quota_id = q.id limit 1` as {
      serial_number: string;
      whatsapp: string;
      name: string;
    }[];

  if (raffleResult.length === 0) {
    throw new Error("Raffle not found");
  }

  return raffleResult[0];
}