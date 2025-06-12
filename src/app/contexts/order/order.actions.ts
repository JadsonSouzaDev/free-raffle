"use server";

import { getQuote } from "@/app/utils/quote";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { createPayment } from "./payment.actions";
import { formatTimeRemaining } from "@/app/utils/time";
import { DEFAULT_PAGINATION, PaginationRequest } from "../common/pagination";

const MAX_NUMBER = 1000000;

const createOrderSchema = z.object({
  userId: z.string().min(1),
  raffleId: z.string().uuid(),
  quantity: z.number().min(1),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export async function createOrder(data: CreateOrderFormData) {
  const { userId, raffleId, quantity } = createOrderSchema.parse(data);
  const sql = neon(`${process.env.DATABASE_URL}`);

  // If raffle is not found, throw error
  const raffle = await sql`
    SELECT * FROM raffles WHERE id = ${raffleId}
  `;

  if (!raffle) {
    throw new Error("Raffle not found");
  }

  // Create order
  const rawOrder = await sql`
    INSERT INTO orders (user_id, raffle_id, status, quotas_quantity)
    VALUES (${userId}, ${raffleId}, 'pending', ${quantity})
    RETURNING *
  `;

  const prices = await sql`
    SELECT price FROM raffles_prices WHERE raffle_id = ${raffleId} AND active = true AND quantity <= ${quantity} ORDER BY quantity DESC LIMIT 1
  `;

  if (!prices.length) {
    throw new Error("Raffle not found");
  }

  const amount = Number(prices[0].price) * Number(quantity);

  // Create payment
  const fixedAmount = Number(amount.toFixed(2));
  const payment = await createPayment(rawOrder[0].id, fixedAmount);

  // Update order status to reserved
  const updatedOrder = await sql`
    UPDATE orders SET status = 'waiting_payment' WHERE id = ${rawOrder[0].id} RETURNING *
  `;

  return { id: updatedOrder[0].id, payment };
}

export async function orderPaid(orderId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // Update payment status to completed
  await sql`
    UPDATE payments SET status = 'completed' WHERE order_id = ${orderId}
  `;

  const order = await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND status IN ('waiting_payment', 'pending', 'expired') AND active = true LIMIT 1
  `;

  if (!order || order.length === 0) {
    throw new Error("Order not found or not waiting payment");
  }

  await sql`
    UPDATE orders SET status = 'paid' WHERE id = ${orderId}
  `;

  // Create quotes
  const quotasQuantity = order[0].quotas_quantity;
  const raffleId = order[0].raffle_id;
  let createdQuotes = 0;
  const exclude: number[] = [];
  while (createdQuotes < quotasQuantity) {
    const quote = getQuote(MAX_NUMBER, exclude);
    const quotaAlreadyExists = await existsQuote(quote, raffleId);
    if (!quotaAlreadyExists) {
      const isAwarded = await getAwardedQuote(quote, raffleId);
      if (isAwarded) {
        await sql`
          INSERT INTO quotas (serial_number, raffle_id, order_id, status, raffle_awarded_quote_id)
          VALUES (${quote}, ${raffleId}, ${orderId}, 'reserved', ${isAwarded})

          UPDATE raffles_awarded_quotes SET user_id = ${order[0].user_id} WHERE id = ${isAwarded}
        `;
      } else {
        await sql`
         INSERT INTO quotas (serial_number, raffle_id, order_id, status)
         VALUES (${quote}, ${raffleId}, ${orderId}, 'reserved')
       `;
      }
      createdQuotes++;
      exclude.push(quote);
    } else {
      exclude.push(quote);
    }
  }

  // Update order status to paid
  await sql`
    UPDATE orders SET status = 'completed' WHERE id = ${orderId}
  `;
}

async function getAwardedQuote(
  serialNumber: number,
  raffleId: string
): Promise<string | null> {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const quote = await sql`
    SELECT id FROM raffles_awarded_quotes WHERE reference_number = ${serialNumber} AND raffle_id = ${raffleId} AND active = true LIMIT 1
  `;

  return quote.length > 0 ? quote[0].id : null;
}

async function existsQuote(
  serialNumber: number,
  raffleId: string
): Promise<boolean> {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const quote = await sql`
    SELECT id FROM quotas WHERE serial_number = ${serialNumber} AND raffle_id = ${raffleId} AND active = true
  `;

  return quote.length > 0 ? true : false;
}

export async function getOrdersByUser(rawWhatsapp: string) {
  const whatsapp = `+55${rawWhatsapp.replace(/\D/g, "")}`;
  const sql = neon(`${process.env.DATABASE_URL}`);

  const orders = await sql`
    SELECT o.*, p.gateway_qrcode, p.gateway_qrcode_base64, p.gateway, p.amount, r.title as raffle_title
    FROM orders o
    LEFT JOIN payments p ON o.id = p.order_id
    LEFT JOIN raffles r ON o.raffle_id = r.id
    WHERE o.user_id = ${whatsapp} AND o.active = true
    ORDER BY o.created_at DESC
  `;

  // If order is not completed, check if it has expired
  const ordersToCheck = orders.filter((order) => order.status !== "completed");
  for (const order of ordersToCheck) {
    const timeRemaining = formatTimeRemaining(order.created_at);
    if (timeRemaining === "Tempo esgotado") {
      await sql`UPDATE orders SET status = 'expired' WHERE id = ${order.id}`;
      await sql`UPDATE payments SET status = 'expired' WHERE order_id = ${order.id}`;
      order.status = "expired";
    }
  }

  const ordersWithQuotas = await Promise.all(
    orders.map(async (order) => ({
      id: order.id,
      raffleId: order.raffle_id,
      raffleTitle: order.raffle_title,
      userId: order.user_id,
      quantity: order.quotas_quantity,
      status: order.status,
      createdAt: order.created_at,
      payment: order.gateway_qrcode || order.gateway === "MANUAL"
        ? {
            amount: order.amount,
            qrCode: order.gateway_qrcode,
            qrCodeBase64: order.gateway_qrcode_base64,
          }
        : undefined,
      quotas:
        order.status === "completed"
          ? (
              await sql`
      SELECT serial_number FROM quotas WHERE order_id = ${order.id} AND active = true
    `
            ).map((quota) => quota.serial_number)
          : [],
      isWinner: await isWinner(order.id),
      winnerQuotas: await getWinnerQuotas(order.id),
    }))
  );
  return ordersWithQuotas;
}

export async function getOrders({ raffleId, userId, pagination } : { raffleId?: string, userId?: string, pagination: PaginationRequest } = {pagination: DEFAULT_PAGINATION}) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const where = sql`
    WHERE 1=1
    AND o.active = true
    ${raffleId ? sql`AND o.raffle_id = ${raffleId}` : sql``}
    ${userId ? sql`AND o.user_id = ${userId}` : sql``}
  `;

  const countQuery = await sql`
    SELECT COUNT(*) FROM orders o
    ${where}
  `;

  const count = countQuery[0].count;

  const orders = await sql`
    SELECT o.*, p.gateway_qrcode, p.gateway_qrcode_base64, p.amount, p.gateway
    FROM orders o
    LEFT JOIN payments p ON o.id = p.order_id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT ${pagination.limit}
    OFFSET ${(pagination.page - 1) * pagination.limit}
  `;

  const ordersWithQuotas = await Promise.all(
    orders.map(async (order) => ({
      id: order.id,
      raffleId: order.raffle_id,
      userId: order.user_id,
      quotasQuantity: order.quotas_quantity,
      status:
        order.status === "completed"
          ? order.status
          : new Date().getTime() - new Date(order.created_at).getTime() >
            5 * 60 * 1000
          ? "expired"
          : order.status,
      createdAt: order.created_at,
      payment: order.gateway_qrcode || order.gateway === "MANUAL"
        ? {
            amount: order.amount,
            qrCode: order.gateway_qrcode,
            qrCodeBase64: order.gateway_qrcode_base64,
            gateway: order.gateway,
            type: "pix",
          }
        : undefined,
      quotas:
        order.status === "completed"
          ? (
              await sql`
      SELECT serial_number FROM quotas WHERE order_id = ${order.id} AND active = true
    `
            ).map((quota) => quota.serial_number)
          : [],
    }))
  );

  return {
    data: ordersWithQuotas,
    total: count,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(count / pagination.limit)
  }
}

export async function updateOrderUser(orderId: string, userId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // Verificar se o pedido existe
  const order = await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND active = true LIMIT 1
  `;

  if (!order || order.length === 0) {
    throw new Error("Pedido não encontrado");
  }

  // Verificar se o usuário existe
  const user = await sql`
    SELECT * FROM users WHERE whatsapp = ${userId} AND active = true LIMIT 1
  `;

  if (!user || user.length === 0) {
    throw new Error("Usuário não encontrado");
  }

  // Atualizar o usuário do pedido
  await sql`
    UPDATE orders SET user_id = ${userId} WHERE id = ${orderId}
  `;

  // Se o pedido tiver cotas premiadas, atualizar o usuário delas também
  await sql`
    UPDATE raffles_awarded_quotes SET user_id = ${userId}
    WHERE id IN (
      SELECT raffle_awarded_quote_id 
      FROM quotas 
      WHERE order_id = ${orderId} 
      AND raffle_awarded_quote_id IS NOT NULL
    )
  `;
}

export async function isWinner(orderId: string): Promise<boolean> {
  const sql = neon(`${process.env.DATABASE_URL}`);

  //Verifica se o pedido tem cota ganhadora do sorteio
  const isWinner = await sql`
    SELECT * from raffles WHERE winner_quota_id IN (
      SELECT id FROM quotas WHERE order_id = ${orderId} AND active = true
    )
  `;

  return isWinner.length > 0;
}

export async function getWinnerQuotas(orderId: string): Promise<number[]> {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const winnerQuotas = await sql`
    SELECT serial_number FROM quotas WHERE order_id = ${orderId} AND active = true AND raffle_awarded_quote_id IS NOT NULL
  `;

  return winnerQuotas.map((quota) => quota.serial_number);
}


export async function deleteOrder(orderId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  await sql`
    UPDATE orders SET active = false WHERE id = ${orderId}
  `;
}