import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  source: {
    client: process.env.SOURCE_DB_CLIENT,
    connection: {
      host: process.env.SOURCE_DB_HOST,
      user: process.env.SOURCE_DB_USER,
      password: process.env.SOURCE_DB_PASSWORD,
      database: process.env.SOURCE_DB_NAME,
      port: process.env.SOURCE_DB_PORT
    }
  },
  target: {
    client: process.env.TARGET_DB_CLIENT,
    connection: {
      host: process.env.TARGET_DB_HOST,
      user: process.env.TARGET_DB_USER,
      password: process.env.TARGET_DB_PASSWORD,
      database: process.env.TARGET_DB_NAME,
      port: process.env.TARGET_DB_PORT
    }
  }
}; 