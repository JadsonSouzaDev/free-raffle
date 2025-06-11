import { logger } from '../../config/logger.js';
import { formatWhatsApp, isValidWhatsApp } from '../../utils/whatsapp.js';
import { generateRejectedReport } from '../../utils/report.js';

export async function transformUsers(data) {
  try {
    logger.info('Iniciando transformação dos dados...');
    
    // Array para armazenar registros rejeitados
    const rejectedRecords = [];
    
    // Contadores para o relatório
    const stats = {
      total: data.length,
      whatsappInvalido: 0,
      duplicados: 0,
      validos: 0
    };
    
    // Mapa para detectar e lidar com duplicatas
    const whatsappMap = new Map();
    
    const transformedData = data.map(customer => {
      // Cria o objeto com os campos mapeados
      const whatsapp = formatWhatsApp(customer.telephone);
      
      const transformedCustomer = {
        whatsapp,
        name: customer.nome,
        roles: ['customer']
      };

      // Log detalhado da transformação do telefone
      logger.debug('Transformação de telefone:', {
        original: customer.telephone,
        formatado: whatsapp,
        valido: isValidWhatsApp(whatsapp)
      });

      return transformedCustomer;
    }).filter(customer => {
      // Função auxiliar para adicionar registro rejeitado
      const addRejectedRecord = (original, motivo) => {
        rejectedRecords.push({
          nome_original: original.nome,
          telefone_original: original.telephone,
          motivo_rejeicao: motivo
        });
      };

      // Encontra o registro original correspondente
      const originalRecord = data.find(d => formatWhatsApp(d.telephone) === customer.whatsapp);

      // Verifica se o WhatsApp é válido
      if (!isValidWhatsApp(customer.whatsapp)) {
        stats.whatsappInvalido++;
        addRejectedRecord(originalRecord, 'Formato inválido ou número de dígitos incorreto');
        return false;
      }

      // Verifica se já existe um registro com este WhatsApp
      if (whatsappMap.has(customer.whatsapp)) {
        stats.duplicados++;
        addRejectedRecord(originalRecord, `Duplicado - Já existe registro com este WhatsApp: ${customer.whatsapp}`);
        return false;
      }

      // Adiciona ao mapa e mantém o registro
      whatsappMap.set(customer.whatsapp, customer);
      stats.validos++;
      return true;
    });

    // Gera o relatório CSV de registros rejeitados
    const reportFile = generateRejectedReport(rejectedRecords, 'users');

    // Log do relatório de transformação
    logger.info('Relatório de transformação:', {
      totalRegistros: stats.total,
      registrosValidos: stats.validos,
      registrosInvalidos: stats.whatsappInvalido,
      registrosDuplicados: stats.duplicados,
      arquivoRejeitados: reportFile
    });

    // Log de exemplo dos dados transformados
    if (transformedData.length > 0) {
      logger.info('Exemplo de registros válidos:', {
        primeiro: transformedData[0],
        ultimo: transformedData[transformedData.length - 1]
      });
    }

    logger.info('Transformação dos dados concluída');
    return transformedData;
  } catch (error) {
    logger.error('Erro durante a transformação:', error);
    throw error;
  }
} 