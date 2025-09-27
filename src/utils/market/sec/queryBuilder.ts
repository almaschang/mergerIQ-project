import { SECQueryParams } from './types';

export function buildSecQuery(params: SECQueryParams): string {
  if (!params.ticker && !params.companyName) {
    return '';
  }

  const queryParts: string[] = [];

  // Add ticker query if provided
  if (params.ticker) {
    queryParts.push(`ticker:"${params.ticker.toUpperCase().trim()}"`);
  }

  // Add company name query if provided
  if (params.companyName) {
    // Escape special characters and wrap in quotes
    const escapedName = params.companyName
      .replace(/[+\-&|!(){}[\]^"~*?:\\]/g, '\\$&')
      .trim();
    queryParts.push(`companyName:"${escapedName}"`);
  }

  if (params.formType && params.formType !== 'ALL') {
    queryParts.push(`formType:"${params.formType.trim()}"`);
  }

  if (params.startDate) {
    const endDate = params.endDate || new Date().toISOString().split('T')[0];
    queryParts.push(`filedAt:[${params.startDate} TO ${endDate}]`);
  }

  // If both ticker and company name are provided, use OR operator
  if (queryParts.length > 1 && params.ticker && params.companyName) {
    const [tickerQuery, nameQuery, ...rest] = queryParts;
    return `(${tickerQuery} OR ${nameQuery}) ${rest.length ? 'AND ' + rest.join(' AND ') : ''}`;
  }

  return queryParts.join(' AND ');
}