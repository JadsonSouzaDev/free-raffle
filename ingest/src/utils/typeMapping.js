// Mapeamento de tipos de dados do MySQL para PostgreSQL
export const mysqlToPostgresTypeMap = {
  // Números
  'tinyint': 'smallint',
  'smallint': 'smallint',
  'mediumint': 'integer',
  'int': 'integer',
  'bigint': 'bigint',
  'decimal': 'decimal',
  'float': 'real',
  'double': 'double precision',

  // Texto
  'char': 'char',
  'varchar': 'varchar',
  'tinytext': 'text',
  'text': 'text',
  'mediumtext': 'text',
  'longtext': 'text',

  // Data e Hora
  'date': 'date',
  'datetime': 'timestamp',
  'timestamp': 'timestamp',
  'time': 'time',
  'year': 'integer',

  // Binários
  'binary': 'bytea',
  'varbinary': 'bytea',
  'tinyblob': 'bytea',
  'blob': 'bytea',
  'mediumblob': 'bytea',
  'longblob': 'bytea',

  // Booleanos
  'boolean': 'boolean',
  'bool': 'boolean',

  // Outros
  'enum': 'text',
  'set': 'text',
  'json': 'jsonb'
};

// Função para converter tipo MySQL para PostgreSQL
export function convertDataType(mysqlType) {
  // Remove parênteses e argumentos do tipo (ex: varchar(255) -> varchar)
  const baseType = mysqlType.toLowerCase().split('(')[0];
  return mysqlToPostgresTypeMap[baseType] || 'text'; // 'text' como fallback
} 