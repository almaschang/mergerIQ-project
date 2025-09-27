export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  industry: string;
}

export interface CompanySearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}