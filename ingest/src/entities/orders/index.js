import { loadOrders } from "./load.js";
import { transformOrders } from "./transform.js";
import { extractOrders } from "./extract.js";
import { logger } from "../../config/logger.js";

export async function migrateOrders(sourceDb, targetDb) {
  try {
    // Executa o processo ETL
    const extractedData = await extractOrders(sourceDb);
    const transformedData = await transformOrders(extractedData);
    await loadOrders(targetDb, transformedData);

    logger.info("Migração de participantes para orders concluída com sucesso!");
  } catch (error) {
    logger.error("Erro durante a migração:", error);
    throw error;
  }
}