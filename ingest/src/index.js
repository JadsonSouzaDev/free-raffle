import { dbConfig } from './config/database.js';
import { logger } from './config/logger.js';
import knex from 'knex';
import { migrateUsers } from './entities/users/index.js';

// Conexões com os bancos de dados
const sourceDb = knex(dbConfig.source);
const targetDb = knex(dbConfig.target);

// Adiciona log de queries para ambas as conexões
sourceDb.on('query', (query) => {
  logger.info('MySQL Query:', {
    sql: query.sql,
    bindings: query.bindings,
    connectionId: query.__knexQueryUid
  });
});

targetDb.on('query', (query) => {
  logger.info('PostgreSQL Query:', {
    sql: query.sql,
    bindings: query.bindings,
    connectionId: query.__knexQueryUid
  });
});

async function runMigrations() {
  try {
    // Por enquanto só temos a migração de users, mas podemos adicionar mais aqui
    await migrateUsers(sourceDb, targetDb);
  } catch (error) {
    logger.error('Erro durante as migrações:', error);
  } finally {
    await sourceDb.destroy();
    await targetDb.destroy();
  }
}

// Executa as migrações
runMigrations(); 