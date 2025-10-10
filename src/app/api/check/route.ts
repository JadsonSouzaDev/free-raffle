import { neon } from "@neondatabase/serverless";

const MAX_NUMBER = 999999;

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== process.env.JWT_SECRET) {
    return new Response(
      JSON.stringify({ status: "error", message: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const sql = neon(process.env.DATABASE_URL!);

  // Get orders with quotas quantity different from total quotas
  const orders = await sql`
SELECT
	o.id,
	r.id as raffle_id,
	o.quotas_quantity,
	COUNT(q.id) AS total_quotas
FROM
	orders o
left JOIN raffles r on r.id = o.raffle_id
LEFT JOIN payments p ON p.order_id = o.id
LEFT JOIN quotas q ON q.order_id = o.id
WHERE
	o.active
	AND o.status = 'paid'
GROUP BY
	o.id,
	r.id,
	o.quotas_quantity
HAVING
	COUNT(q.id) <> o.quotas_quantity
ORDER BY
	o.created_at DESC;
            `;

  // Process each order
  for (const order of orders) {
    const quotasQuantity = order.quotas_quantity - order.total_quotas;
    const raffleId = order.raffle_id;
    const orderId = order.id;

    console.info(
      `Recovery quotas for order ${order.id} with ${quotasQuantity} quotas`
    );

    // Get available quota numbers
    const availableQuotasResult = await sql`
      SELECT number
      FROM generate_series(1, ${MAX_NUMBER}) AS gs(number)
      WHERE NOT EXISTS (
          SELECT 1
          FROM quotas q
          WHERE q.raffle_id = ${raffleId}
            AND q.serial_number = gs.number
      )
      ORDER BY random()
      LIMIT ${quotasQuantity};
    `;

    // Get awarded quotas from database
    const awardedQuotas = await sql`
    SELECT reference_number, id FROM raffles_awarded_quotes WHERE raffle_id = ${raffleId}
  `;

    // Transform available quotas to array of objects with awardedId
    const selectedQuotas = availableQuotasResult.map((quota) => ({
      number: quota.number,
      awardedId:
        awardedQuotas.find(
          (awarded) => awarded.reference_number === quota.number
        )?.id || null,
    }));

    // The previous method created too many placeholders at once, making a single prepared statement with all (e.g., 35k) parameters,
    // but the `.query` call is always only given the current batch of values (e.g., 1000). So we need to create the placeholders and values for each batch, not for all rows at once.
    const batchSize = 1000;

    for (let i = 0; i < selectedQuotas.length; i += batchSize) {
      const batchQuotas = selectedQuotas.slice(i, i + batchSize);

      // Prepare placeholders and values for just this batch
      const placeholders = batchQuotas
        .map(
          (_, index) =>
            `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
              index * 5 + 4
            }, $${index * 5 + 5})`
        )
        .join(", ");

      const values = batchQuotas.flatMap((row) => [
        row.number,
        raffleId,
        orderId,
        "reserved",
        row.awardedId,
      ]);

      const query = `INSERT INTO quotas (serial_number, raffle_id, order_id, status, raffle_awarded_quote_id) VALUES ${placeholders}`;
      await sql.query(query, values);
    }

    // Update awarded quotas user_id
    if (selectedQuotas.some((quota) => quota.awardedId !== null)) {
      await sql`
    UPDATE raffles_awarded_quotes SET user_id = ${
      order[0].user_id
    } WHERE id = ANY(${selectedQuotas
        .map((quota) => quota.awardedId)
        .filter((id) => !!id)})
    `;
    }

    // Update payment status to completed
    await sql`
  UPDATE payments SET status = 'completed' WHERE order_id = ${orderId}
`;

    // Update order status to paid
    await sql`
  UPDATE orders SET status = 'completed' WHERE id = ${orderId}
`;
  }

  return new Response(
    JSON.stringify({
      status: "success",
      message: `Recovered ${orders.length} quotas`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
