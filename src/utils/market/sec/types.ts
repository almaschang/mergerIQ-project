export interface SECQueryParams {
  ticker?: string;
  companyName?: string;
  formType?: string;
  startDate?: string;
  endDate?: string;
}

export interface SECApiResponse {
  total: number;
  filings: SECFilingResponse[];
}

export interface SECFilingResponse {
  id: string;
  companyName: string;
  ticker: string;
  formType: string;
  filedAt: string;
  periodOfReport?: string;
  items?: string[];
  documentFormatFiles: {
    documentUrl: string;
    description: string;
    size: number;
  }[];
}