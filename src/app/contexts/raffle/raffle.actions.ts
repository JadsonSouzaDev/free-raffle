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

export async function createRaffle(formData: CreateRaffleFormData) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // create raffle
  const title = formData.title
  const images_urls = formData.imagesUrls.join(",");
  const description = formData.description;
  const result =
    (await sql`INSERT INTO raffles (title, images_urls, description) VALUES (${title}, ARRAY[${images_urls}], ${description}) RETURNING id`) as unknown as {
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
