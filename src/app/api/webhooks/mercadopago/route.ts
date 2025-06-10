import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { orderPaid } from "@/app/contexts/order/order.actions";
import { EventEmitter } from "events";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// Interface para o tipo de dados do evento
interface PaymentEvent {
  type: 'payment' | 'connected';
  orderId?: string;
}

// Criando um EventEmitter global para gerenciar os eventos de pagamento
const paymentEvents = new EventEmitter();

// Endpoint GET para SSE
export async function GET(request: NextRequest) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sql = neon(process.env.DATABASE_URL!);

  const orderId = request.nextUrl.searchParams.get('orderId');

  if (!orderId) {
    return new Response("Order ID is required", { status: 400 });
  }

  const paymentStatus = await sql`
    SELECT status FROM payments WHERE order_id = ${orderId}
  `;

  // Função para enviar eventos para o cliente
  const sendEvent = async (data: PaymentEvent) => {
    const eventString = `data: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(eventString));
  };

  if (paymentStatus.length > 0 && paymentStatus[0].status === "completed") {
    sendEvent({ type: 'payment', orderId: orderId! });
  }

  // Listener para eventos de pagamento
  const onPayment = (orderIdParam: string) => {
    if (orderId === orderIdParam) {
      sendEvent({ type: 'payment', orderId: orderIdParam });
    }
  };

  // Registra o listener
  paymentEvents.on('payment.approved', onPayment);

  // Remove o listener quando a conexão for fechada
  request.signal.addEventListener('abort', () => {
    paymentEvents.off('payment.approved', onPayment);
  });

  // Envia um evento inicial para manter a conexão viva
  sendEvent({ type: 'connected' });

  return new Response(stream.readable, { headers });
}

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

    // Caso já tenha sido pago, não faz nada
    const paymentExists = await sql`
      SELECT id FROM payments WHERE gateway_id = ${paymentId} AND status in ('approved', 'completed')
    `;
    if (paymentExists.length > 0) {
      return new Response("OK", { status: 200 });
    }

    // Atualiza o status do pagamento no banco
    await sql`
      UPDATE payments 
      SET status = ${payment.status}
      WHERE gateway_id = ${paymentId}
    `;

    // Se o pagamento foi aprovado, processa o pedido e emite o evento
    if (payment.status === "approved") {
      await orderPaid(orderId);
      paymentEvents.emit('payment.approved', orderId);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Error processing webhook: ${error}`, { status: 500 });
  }
} 