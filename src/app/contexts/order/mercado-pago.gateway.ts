import { MercadoPagoConfig, Payment } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

interface CreatePixPaymentInput {
  orderId: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerLastName: string;
}

export async function createPixPayment(input: CreatePixPaymentInput) {
  const payment = new Payment(mercadopago);
  
  // Cria data de expiração para 5 minutos a partir de agora
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 65); // 1 hora e 5 minutos que na verdade é 5 minutos

  const paymentData = await payment.create({
    body: {
      transaction_amount: input.amount,
      description: input.description,
      payment_method_id: "pix",
      payer: {
        first_name: input.payerName,
        last_name: input.payerLastName,
        email: input.payerEmail,
      },
      metadata: {
        order_id: input.orderId,
      },
      date_of_expiration: expirationDate.toISOString(),
    },
  });

  return {
    id: paymentData.id,
    status: paymentData.status,
    qr_code: paymentData.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64:
      paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
  };
}

export async function getPaymentStatus(paymentId: string) {
  const payment = await new Payment(mercadopago).get({ id: paymentId });
  return payment.status;
}
