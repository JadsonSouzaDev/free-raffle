import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { orderPaid } from "@/app/contexts/order/order.actions";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received', body);
    
    // Verifica se é uma notificação de pagamento
    if (body.type !== "payment") {
      return new Response("OK", { status: 200 });
    }

    // Se o pagamento foi criado, não faz nada
    if (body.action === "payment.created") {
      return new Response("OK", { status: 200 });
    }

    const paymentId = body.data.id;
    
    // Busca os detalhes do pagamento no Mercado Pago
    const payment = await new Payment(mercadopago).get({ id: paymentId });
    const orderId = payment.metadata.order_id;
    
    const sql = neon(process.env.DATABASE_URL!);

    // Atualiza o status do pagamento no banco
    await sql`
      UPDATE payments 
      SET status = ${payment.status}
      WHERE gateway_id = ${paymentId}
    `;

    // Se o pagamento foi aprovado, processa o pedido
    if (payment.status === "approved") {
      await orderPaid(orderId);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
} 