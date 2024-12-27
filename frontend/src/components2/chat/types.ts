export interface Citation {
  id: number;
  source: string;
  page: number;
  content: string;
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  citations?: Citation[];
  isComplete?: boolean;  // Indicates if streaming is complete
}

export interface StreamChunk {
  citations?: Citation[];
  chunk?: string;
}

// State for managing message streaming
export interface MessageStreamState {
  isStreaming: boolean;
  accumulatedText: string;
  citations: Citation[];
} 