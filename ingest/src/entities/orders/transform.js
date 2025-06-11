import { logger } from "../../config/logger.js";
import { formatWhatsApp, isValidWhatsApp } from "../../utils/whatsapp.js";
import { generateRejectedReport } from "../../utils/report.js";

export async function transformOrders(data) {
  try {
    logger.info("Iniciando transformação dos dados da tabela participant");

    const rejectedRecords = [];
    const stats = {
      total: data.length,
      whatsappInvalido: 0,
      validos: 0,
    };

    const transformedData = data.map((participant) => {
      const whatsapp = formatWhatsApp(participant.telephone);
      const quotasNumber = JSON.parse(participant.numbers);

      // TODO: Remover hardcoded raffleId
      const raffleId = "01165fe1-4c70-43cb-95e5-75582224199b";

      const order = {
        raffle_id: raffleId,
        user_id: whatsapp,
        user_name: participant.name,
        quotas_quantity: quotasNumber.length,
        status: "completed",
      };

      const payment = {
        order_id: "",
        gateway: "MANUAL",
        gateway_id: "manual",
        amount: participant.valor,
        status: "completed",
      };

      const quotas = quotasNumber.map((quota) => {
        return {
          raffle_id: raffleId,
          order_id: "",
          serial_number: quota,
          status: "reserved",
        };
      });

      const transformedOrder = {
        order,
        payment,
        quotas,
      };

      return transformedOrder;
    }).filter(data => {
      const order = data.order;
      const addRejectedRecord = (original, motivo) => {
        rejectedRecords.push({
          nome_original: original.nome,
          telefone_original: original.telephone,
          motivo_rejeicao: motivo
        });
      };

      if (!isValidWhatsApp(order.user_id)) {
        stats.whatsappInvalido++;
        addRejectedRecord(order, 'Formato inválido ou número de dígitos incorreto');
        return false;
      }

      stats.validos++;
      return true;
    });

    // Gera o relatório CSV de registros rejeitados
    const reportFile = generateRejectedReport(rejectedRecords, 'orders');
    logger.info(`Relatório de registros rejeitados gerado em: ${reportFile}`);

    logger.info("Transformação dos dados concluída");
    return transformedData;
  } catch (error) {
    logger.error("Erro durante a transformação:", error);
    throw error;
  }
}
