"use server";

import { neon } from "@neondatabase/serverless";
import { createPixPayment } from "./mercado-pago.gateway";
import { orderPaid } from "./order.actions";

export async function createPayment(orderId: string, amount: number) {
  const sql = neon(process.env.DATABASE_URL!);

  // Get order details
  const order = await sql`
    SELECT o.*, u.name, u.whatsapp, r.title
    FROM orders o
    JOIN users u ON o.user_id = u.whatsapp
    JOIN raffles r ON o.raffle_id = r.id
    WHERE o.id = ${orderId}
    ORDER BY o.created_at DESC
    LIMIT 1
  `;

  if (!order.length) {
    throw new Error("Order not found");
  }

  const orderData = order[0];
  const whatsapp = orderData.whatsapp.replace('+55', '').replace(/\D/g, '');
  const payerEmail = `${whatsapp}@caradebone.com`;
  const payerName = orderData.name.split(' ')[0] || 'Pix';
  const payerLastName = orderData.name.split(' ').slice(1).join(' ') || 'Pix';

  // Create payment in Mercado Pago
  const payment = await createPixPayment({
    orderId,
    amount,
    description: `${orderData.quotas_quantity} cota(s) para ${orderData.title}`,
    payerEmail,
    payerName,
    payerLastName,
  });

  // Save payment details in database
  await sql`
    INSERT INTO payments (
      order_id,
      gateway,
      gateway_id,
      gateway_qrcode,
      gateway_qrcode_base64,
      status,
      amount
    ) VALUES (
      ${orderId},
      'MERCADO_PAGO',
      ${payment.id},
      ${payment.qr_code},
      ${payment.qr_code_base64},
      ${payment.status},
      ${amount}
    )
  `;

  return {
    id: payment.id,
    qrCode: payment.qr_code,
    qrCodeBase64: payment.qr_code_base64,
    status: payment.status,
  };
}

export async function getPayment(orderId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const payment = await sql`
    SELECT * FROM payments WHERE order_id = ${orderId}
  `;

  if (payment.length === 0) {
    return null;
  }

  return {
    id: payment[0].id,
    orderId: payment[0].order_id,
    gateway: payment[0].gateway,
    gatewayId: payment[0].gateway_id,
    status: payment[0].status,
    createdAt: payment[0].created_at,
    updatedAt: payment[0].updated_at
  }
}

export async function payOrderManually(orderId: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const order = await sql`
    SELECT * FROM orders WHERE id = ${orderId}
  `;

  if (!order.length) {
    throw new Error("Order not found");
  }
  await sql`
    UPDATE payments SET status = 'approved', gateway_id = 'manual', gateway = 'MANUAL' WHERE order_id = ${orderId}
  `;

  await orderPaid(orderId);
}