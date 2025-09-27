export interface SECFiling {
  id: string;
  type: string;
  title: string;
  filingDate: string;
  reportDate?: string;
  documentUrl: string;
  formType: string;
  description: string;
  fileSize: number;
}

export type FilingType = '10-K' | '10-Q' | '8-K' | '424B' | 'SC 13' | '13F' | '4' | 'ALL';