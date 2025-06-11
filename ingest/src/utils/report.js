import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger.js';

export function generateRejectedReport(rejectedRecords, entityName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = 'reports';
  const filename = path.join(reportDir, `rejected_${entityName}_records_${timestamp}.csv`);

  // Cria o diretório de relatórios se não existir
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Cabeçalho do CSV
  const headers = ['nome_original', 'telefone_original', 'motivo_rejeicao'];
  const csvContent = [
    headers.join(','),
    ...rejectedRecords.map(record => [
      // Escapa campos que podem conter vírgulas
      `"${record.nome_original}"`,
      `"${record.telefone_original}"`,
      `"${record.motivo_rejeicao}"`
    ].join(','))
  ].join('\n');

  fs.writeFileSync(filename, csvContent, 'utf8');
  logger.info(`Relatório de registros rejeitados gerado: ${filename}`);
  return filename;
} 