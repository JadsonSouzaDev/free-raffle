import { logger } from '../../config/logger.js';

export async function extractUsers(sourceDb) {
  try {
    logger.info('Iniciando extração dos dados da tabela customers do MySQL');
    
    // Log da query que será executada
    const query = sourceDb.select('*').from('customers').toQuery();
    logger.info('Query de extração:', { query });
    
    const data = await sourceDb.select('*').from('customers');
    logger.info(`${data.length} registros extraídos da tabela customers`);
    return data;
  } catch (error) {
    logger.error('Erro durante a extração:', error);
    throw error;
  }
} 