import { logger } from '../../config/logger.js';

export async function extractOrders(sourceDb) {
  try {
    logger.info('Iniciando extração dos dados da tabela participant do MySQL');

    const query = sourceDb.select('*').from('participant').toQuery();
    logger.info('Query de extração:', { query });

    const data = await sourceDb.select('*').from('participant');
    logger.info(`${data.length} registros extraídos da tabela participant`);
    return data;
  } catch (error) {
    logger.error('Erro durante a extração:', error);
    throw error;
  }
}