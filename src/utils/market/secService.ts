import { SECFiling, FilingType } from '../../types/secFilings';
import { fetchWithFmpApiKey } from './fmpApiKeys';
import { API_CONFIG } from '../../config/api';

interface FmpSecFiling {
  cik?: string;
  symbol?: string;
  companyName?: string;
  acceptedDate?: string;
  filingDate?: string;
  fillingDate?: string;
  reportDate?: string;
  formType?: string;
  amend?: string | boolean;
  filingUrl?: string;
  finalLink?: string;
  documentUrl?: string;
  description?: string;
}

function normalizeFormType(value?: string): string | undefined {
  if (!value) return undefined;
  return value.toUpperCase();
}

function isMatchingType(filing: FmpSecFiling, type?: FilingType): boolean {
  if (!type || type === 'ALL') return true;
  const formType = normalizeFormType(filing.formType);
  return formType === type.toUpperCase();
}

function buildFilingId(filing: FmpSecFiling, fallbackSymbol: string): string {
  return [
    filing.symbol || fallbackSymbol,
    filing.acceptedDate || filing.filingDate || filing.fillingDate || Date.now().toString(),
    filing.formType || 'filing'
  ].join('-');
}

function isAmendment(value: string | boolean | undefined): boolean {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'amendment';
  }
  return Boolean(value);
}

function formatFmpFiling(filing: FmpSecFiling, symbol: string): SECFiling {
  const filingDate = filing.filingDate || filing.fillingDate || filing.acceptedDate || null;
  const reportDate = filing.reportDate || null;
  const formType = filing.formType || 'Unknown';
  const amendment = isAmendment(filing.amend);

  const descriptionParts: string[] = [];
  descriptionParts.push(filing.companyName || symbol);
  if (reportDate) {
    descriptionParts.push(`Report date ${new Date(reportDate).toLocaleDateString()}`);
  }
  if (amendment) {
    descriptionParts.push('Amendment');
  }

  const description = descriptionParts.length
    ? descriptionParts.join(' | ')
    : `${formType} filing for ${symbol}`;

  return {
    id: buildFilingId(filing, symbol),
    type: formType,
    title: `${formType}${amendment ? ' (Amended)' : ''}`,
    filingDate: filingDate ? new Date(filingDate).toLocaleDateString() : new Date().toLocaleDateString(),
    reportDate: reportDate ? new Date(reportDate).toLocaleDateString() : undefined,
    documentUrl: filing.filingUrl || filing.finalLink || filing.documentUrl || '',
    formType,
    description,
    fileSize: 0
  };
}

export async function getCompanyFilings(
  symbol: string,
  type?: FilingType,
  limit: number = 20
): Promise<SECFiling[]> {
  const trimmedSymbol = symbol?.trim().toUpperCase();

  if (!trimmedSymbol) {
    console.warn('No symbol provided for SEC filings');
    return [];
  }

  try {
    const url = `${API_CONFIG.FMP_BASE_URL}/sec_filings/${trimmedSymbol}?limit=${limit}`;
    const response = await fetchWithFmpApiKey(url);

    if (!response.ok) {
      console.error('FMP SEC filings request failed', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const filings: FmpSecFiling[] = Array.isArray(data) ? data : data?.filings || [];

    if (!Array.isArray(filings) || !filings.length) {
      console.info(`No SEC filings returned by FMP for ${trimmedSymbol}`);
      return [];
    }

    return filings
      .filter((filing) => isMatchingType(filing, type))
      .slice(0, limit)
      .map((filing) => formatFmpFiling(filing, trimmedSymbol))
      .filter((filing) => Boolean(filing.documentUrl));
  } catch (error) {
    console.error('Error fetching SEC filings from FMP:', error);
    return [];
  }
}
