"use server";
import { neon } from "@neondatabase/serverless";
import { RaffleFlag } from "./entities";
import { RaffleFlagData } from "./entities";

export async function getRaffleFlags(raffleId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const rawFlags = await sql`SELECT * FROM raffles_flags WHERE id = ${raffleId}`;

  if (rawFlags.length === 0) {
    return null;
  }

  const flags = new RaffleFlag(rawFlags[0] as unknown as RaffleFlagData);
  return {
    flagTopBuyers: flags.flagTopBuyers,
    flagTopBuyersWeek: flags.flagTopBuyersWeek,
    flagTopBuyersDay: flags.flagTopBuyersDay,
    flagLowestQuota: flags.flagLowestQuota,
    flagHighestQuota: flags.flagHighestQuota,
  }
}

export async function updateTopBuyersFlag(raffleId: string, flag: boolean) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  await sql`UPDATE raffles_flags SET flag_top_buyers = ${flag} WHERE id = ${raffleId}`;
}

export async function updateTopBuyerWeekFlag(raffleId: string, flag: boolean) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  await sql`UPDATE raffles_flags SET flag_top_buyers_week = ${flag} WHERE id = ${raffleId}`;
}

export async function updateTopBuyerDayFlag(raffleId: string, flag: boolean) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  await sql`UPDATE raffles_flags SET flag_top_buyers_day = ${flag} WHERE id = ${raffleId}`;
}

export async function updateLowestQuotaFlag(raffleId: string, flag: boolean) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  await sql`UPDATE raffles_flags SET flag_lowest_quota = ${flag} WHERE id = ${raffleId}`;
}

export async function updateHighestQuotaFlag(raffleId: string, flag: boolean) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  await sql`UPDATE raffles_flags SET flag_highest_quota = ${flag} WHERE id = ${raffleId}`;
}
