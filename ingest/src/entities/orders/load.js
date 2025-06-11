import { logger } from "../../config/logger.js";

export async function loadOrders(targetDb, transformedData) {
  try {
    logger.info("Iniciando carregamento dos dados na tabela orders");
    logger.info(`Total de compras a serem processadas: ${transformedData.length}`);

    for (let i = 0; i < transformedData.length; i++) {
      const data = transformedData[i];

      logger.info(`Processando compra de ${data.order.user_id}`);

      // Verifica se o usuário existe
      const userExists = await targetDb("users")
        .where("whatsapp", data.order.user_id)
        .first();

      if (!userExists) {
        // Cria o usuário se não existir
        await targetDb("users").insert({
          whatsapp: data.order.user_id,
          name: data.order.user_name,
          active: true,
          roles: ["customer"]
        });
        logger.info(`Usuário ${data.order.user_id} criado`);
      }

      // Inserir orders
      const {user_name, ...order} = data.order;
      const resultOrders = await targetDb("orders")
        .insert(order)
        .onConflict("id")
        .merge(["raffle_id", "user_id", "quotas_quantity", "status"]) 
        .returning("id");

      // Inserir payments
      const payment = data.payment;
      payment.order_id = resultOrders[0].id;

      await targetDb("payments")
        .insert(payment)
        .onConflict("id")
        .merge(["order_id", "gateway", "gateway_id", "amount", "status"]);

      // Inserir quotas
      const quotas = data.quotas.map(quota => ({
        ...quota,
        order_id: resultOrders[0].id
      }));
      await targetDb("quotas")
        .insert(quotas)
        .onConflict(["id"])
        .merge(["serial_number", "raffle_id", "order_id", "status"]);

      logger.info(`Pedido de ${data.order.user_id} - ${user_name} - processado`);
    }
  } catch (error) {
    logger.error("Erro durante o carregamento:", error);
    throw error;
  }
}
