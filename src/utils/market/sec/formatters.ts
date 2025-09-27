import { SECFilingResponse } from './types';
import { SECFiling } from '../../../types/secFilings';

export function formatFilingResponse(filing: SECFilingResponse): SECFiling {
  return {
    id: filing.id,
    type: filing.formType,
    title: getFilingTitle(filing.formType, filing.documentFormatFiles[0]?.description || ''),
    filingDate: filing.filedAt,
    reportDate: filing.periodOfReport,
    documentUrl: filing.documentFormatFiles[0]?.documentUrl || '',
    formType: filing.formType,
    description: getFilingDescription(filing.formType),
    fileSize: filing.documentFormatFiles[0]?.size || 0
  };
}

function getFilingTitle(formType: string, document: string): string {
  switch (formType) {
    case '10-K':
      return 'Annual Report';
    case '10-Q':
      return 'Quarterly Report';
    case '8-K':
      return 'Current Report';
    case '4':
      return 'Statement of Changes in Beneficial Ownership';
    case '13F':
      return 'Institutional Investment Manager Holdings';
    case '424B':
      return 'Prospectus';
    case 'SC 13':
      return 'Schedule 13 Filing';
    default:
      return `${formType} - ${document}`;
  }
}

function getFilingDescription(formType: string): string {
  switch (formType) {
    case '10-K':
      return 'Comprehensive annual report with detailed financial statements, business description, and analysis';
    case '10-Q':
      return 'Quarterly financial report containing unaudited financial statements and operation details';
    case '8-K':
      return 'Report of unscheduled material events or corporate changes';
    case '4':
      return 'Report of change in insider ownership of securities';
    case '13F':
      return 'Quarterly report of equity holdings filed by institutional investment managers';
    case '424B':
      return 'Prospectus filing under Rule 424(b)';
    case 'SC 13':
      return 'Report of acquisition of beneficial ownership';
    default:
      return 'SEC Filing';
  }
}