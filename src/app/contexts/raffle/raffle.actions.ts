import { neon } from "@neondatabase/serverless";
import { Raffle, RaffleAwardQuotes, RaffleAwardQuotesData, RaffleData, RafflePrice, RafflePriceData, RaffleTopBuyer, RaffleTopBuyerData } from "./entities";

export async function createRaffle(formData: FormData) {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  // create raffle
  const title = formData.get("title");
  const images_urls = formData.get("images_urls");
  const description = formData.get("description");
  const result = await sql`INSERT INTO raffles (title, images_urls, description) VALUES (${title}, ${images_urls}, ${description}) RETURNING id` as unknown as { id: string }[];
  const raffle_id = result[0].id;
  // create prices
  const prices = JSON.parse(formData.get("prices") as unknown as string) as {
    price: number;
    quantity: number;
  }[];
  for (const price of prices) {
    await sql`INSERT INTO raffles_prices (raffle_id, price, quantity) VALUES (${raffle_id}, ${price.price}, ${price.quantity})`;
  }
  // create awarded quotes
  const awarded_quotes = formData.get("awarded_quotes") as unknown as {
    reference_number: number;
  }[];
  if (awarded_quotes) {
  for (const awarded_quote of awarded_quotes) {
      await sql`INSERT INTO raffles_awarded_quotes (raffle_id, reference_number) VALUES (${raffle_id}, ${awarded_quote.reference_number})`;
    }
  }
}

export async function getRaffles(): Promise<Raffle[]> {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffles
  const rawRaffles = await sql`SELECT * FROM raffles WHERE active = true ORDER BY created_at DESC`;
  const raffles: Raffle[] = rawRaffles.map((raffle) => new Raffle(raffle as unknown as RaffleData));

  for (const raffle of raffles) {
    // get prices
    const prices = await sql`SELECT * FROM raffles_prices WHERE raffle_id = ${raffle.id}`;
    raffle.setPrices(prices.map((price) => new RafflePrice(price as unknown as RafflePriceData)));

    // get awarded quotes
    const rawAwardedQuotes = await sql`SELECT * FROM raffles_awarded_quotes WHERE raffle_id = ${raffle.id}`;
    raffle.setAwardedQuotes(rawAwardedQuotes.map((quote) => new RaffleAwardQuotes(quote as unknown as RaffleAwardQuotesData)));
  }

  return raffles;
}

export async function getRaffle(id: string): Promise<Raffle> {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  // get raffle
  const rawRaffle = await sql`SELECT * FROM raffles WHERE id = ${id} AND active = true`;
  if (rawRaffle.length === 0) {
    throw new Error("Raffle not found");
  }
  const raffle = new Raffle(rawRaffle[0] as unknown as RaffleData);

  // get prices
  const prices = await sql`SELECT * FROM raffles_prices WHERE raffle_id = ${raffle.id}`;
  raffle.setPrices(prices.map((price) => new RafflePrice(price as unknown as RafflePriceData)));

  // get awarded quotes
  const rawAwardedQuotes = await sql`SELECT raq.*, u.name as user_name 
  FROM raffles_awarded_quotes raq LEFT JOIN users u on raq.user_id = u.whatsapp 
  WHERE raq.raffle_id = ${raffle.id} and raq.active = true 
  ORDER BY raq.reference_number ASC`;
  raffle.setAwardedQuotes(rawAwardedQuotes.map((quote) => new RaffleAwardQuotes(quote as unknown as RaffleAwardQuotesData)));

  const topBuyers = await sql`SELECT u.whatsapp, u.name, COUNT(q.id) as total 
  from quotas q join orders o on q.order_id = o.id join users u on o.user_id = u.whatsapp 
  group by u.whatsapp, u."name" order by total limit 3`;
  raffle.setTopBuyers(topBuyers.map((buyer) => new RaffleTopBuyer(buyer as unknown as RaffleTopBuyerData)));

  return raffle;
}
