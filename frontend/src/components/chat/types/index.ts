export interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  id: number;
  source: string;
  page: number;
  content: string;
} 