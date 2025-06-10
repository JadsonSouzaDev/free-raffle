"use server";

import { neon } from "@neondatabase/serverless";

export async function searchQuota(raffleId: string, serialNumber: number) {
  const sql = neon(process.env.DATABASE_URL!);

  const quota = await sql`
    SELECT 
      q.id,
      q.serial_number,
      u.name as owner_name,
      u.whatsapp as owner_phone,
      CASE 
        WHEN raq.id IS NOT NULL THEN true 
        ELSE false 
      END as is_awarded
    FROM quotas q
    JOIN orders o ON q.order_id = o.id
    JOIN users u ON o.user_id = u.whatsapp
    LEFT JOIN raffles_awarded_quotes raq ON q.raffle_awarded_quote_id = raq.id
    WHERE q.raffle_id = ${raffleId} 
    AND q.serial_number = ${serialNumber}
    AND q.active = true
    LIMIT 1
  `;

  if (quota.length === 0) {
    return null;
  }

  return quota[0];
}

export async function adjustQuotaNumber(
  raffleId: string,
  quotaId: string,
  newSerialNumber: number,
  whatsapp: string
) {
  const sql = neon(process.env.DATABASE_URL!);

  // Verifica se o novo número já está em uso
  const existingQuota = await sql`
    SELECT id FROM quotas 
    WHERE raffle_id = ${raffleId} 
    AND serial_number = ${newSerialNumber}
    AND active = true
  `;

  if (existingQuota.length > 0) {
    throw new Error("Este número de cota já está em uso");
  }

  // Verifica se a cota atual é premiada
  const isAwarded = await sql`
    SELECT id FROM raffles_awarded_quotes
    WHERE id IN (
      SELECT raffle_awarded_quote_id 
      FROM quotas 
      WHERE id = ${quotaId}
      AND active = true
    )
  `;

  if (isAwarded.length > 0) {
    throw new Error("Não é possível alterar o número de uma cota premiada");
  }

  // Verifica se o novo número é premiado
  const newIsAwarded = await isAwardedQuote(newSerialNumber, raffleId);

  if (newIsAwarded) {
    await sql`
      UPDATE quotas 
      SET serial_number = ${newSerialNumber}, raffle_awarded_quote_id = ${newIsAwarded}
      WHERE id = ${quotaId}
      AND active = true

      UPDATE raffles_awarded_quotes SET user_id = ${whatsapp} WHERE id = ${newIsAwarded}
    `;

  } else {
    // Atualiza o número da cota
    await sql`
      UPDATE quotas 
      SET serial_number = ${newSerialNumber}
      WHERE id = ${quotaId}
      AND active = true
      `;
  }

  return {
    success: true,
    message: "Número da cota atualizado com sucesso",
  };
}

async function isAwardedQuote(
  serialNumber: number,
  raffleId: string
): Promise<string | null> {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const quote = await sql`
    SELECT id FROM raffles_awarded_quotes WHERE reference_number = ${serialNumber} AND raffle_id = ${raffleId} AND active = true LIMIT 1
  `;

  return quote.length > 0 ? quote[0].id : null;
}
