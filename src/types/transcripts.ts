export interface Transcript {
  id: string;
  title: string;
  publishedOn: string;
  symbol: string;
  quarter?: string;
  year?: string;
  content?: string;
}

export interface TranscriptDetails {
  id: string;
  title: string;
  publishedOn: string;
  content: string;
  participants: {
    name: string;
    title: string;
    type: 'executive' | 'analyst'
  }[];
}