import { convertDataType } from '../utils/typeMapping.js';

export async function getTableSchema(sourceDb, tableName) {
  try {
    // Obtém informações sobre as colunas do MySQL
    const columns = await sourceDb.raw(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = ? 
      ORDER BY ORDINAL_POSITION
    `, [tableName]);

    return columns[0];
  } catch (error) {
    throw new Error(`Erro ao obter esquema da tabela ${tableName}: ${error.message}`);
  }
}

export async function createPostgresTable(targetDb, tableName, columns) {
  try {
    // Verifica se a tabela já existe
    const tableExists = await targetDb.schema.hasTable(tableName);
    if (tableExists) {
      console.log(`Tabela ${tableName} já existe no PostgreSQL.`);
      return;
    }

    // Cria a tabela no PostgreSQL
    await targetDb.schema.createTable(tableName, table => {
      columns.forEach(column => {
        const postgresType = convertDataType(column.DATA_TYPE);
        let columnBuilder;

        // Define o tipo da coluna
        if (column.CHARACTER_MAXIMUM_LENGTH) {
          columnBuilder = table[postgresType](column.COLUMN_NAME, column.CHARACTER_MAXIMUM_LENGTH);
        } else {
          columnBuilder = table[postgresType](column.COLUMN_NAME);
        }

        // Define nullable
        if (column.IS_NULLABLE === 'NO') {
          columnBuilder.notNullable();
        }

        // Define valor padrão
        if (column.COLUMN_DEFAULT !== null) {
          columnBuilder.defaultTo(column.COLUMN_DEFAULT);
        }

        // Define chave primária
        if (column.COLUMN_KEY === 'PRI') {
          if (column.EXTRA === 'auto_increment') {
            // No PostgreSQL, usamos SERIAL para auto-incremento
            table.increments(column.COLUMN_NAME);
          } else {
            columnBuilder.primary();
          }
        }
      });
    });

    console.log(`Tabela ${tableName} criada com sucesso no PostgreSQL.`);
  } catch (error) {
    throw new Error(`Erro ao criar tabela ${tableName} no PostgreSQL: ${error.message}`);
  }
} 