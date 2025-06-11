import { logger } from '../../config/logger.js';

export async function loadUsers(targetDb, transformedData) {
  try {
    logger.info('Iniciando carregamento dos dados na tabela users');
    
    // Inserir em lotes para melhor performance
    const batchSize = 1000;
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      // Log da query que será executada
      const query = targetDb('users')
        .insert(batch)
        .onConflict('whatsapp')
        .merge(['name', 'roles'])
        .toQuery();
      
      logger.info(`Query de inserção do lote ${Math.floor(i/batchSize) + 1}:`, { 
        query,
        registros: batch.length,
        primeiro: batch[0],
        ultimo: batch[batch.length - 1]
      });
      
      await targetDb('users')
        .insert(batch)
        .onConflict('whatsapp')
        .merge(['name', 'roles']);
      
      logger.info(`Lote ${Math.floor(i/batchSize) + 1} processado`);
    }
    
    logger.info(`${transformedData.length} registros processados na tabela users`);
  } catch (error) {
    logger.error('Erro durante o carregamento:', error);
    throw error;
  }
} 