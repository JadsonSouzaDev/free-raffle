import { extractUsers } from './extract.js';
import { transformUsers } from './transform.js';
import { loadUsers } from './load.js';
import { logger } from '../../config/logger.js';

export async function migrateUsers(sourceDb, targetDb) {
  try {
    // Executa o processo ETL
    const extractedData = await extractUsers(sourceDb);
    const transformedData = await transformUsers(extractedData);
    await loadUsers(targetDb, transformedData);

    logger.info('Migração de customers para users concluída com sucesso!');
  } catch (error) {
    logger.error('Erro durante o processo ETL:', error);
    throw error;
  }
} 