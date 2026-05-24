export interface NewsItem {
  id: string;
  title: string;
  category: string;
  snippet: string;
  content: string;
  date: string;
  image: string;
  author: string;
  reads: number;
  link?: string;
}

export interface ProgramItem {
  id: string;
  timeStart: string; // e.g., "08:00"
  timeEnd: string; // e.g., "12:00"
  name: string;
  host: string;
  description: string;
  badge?: string; // e.g., "Ao Vivo", "Destaque"
  genre?: string;
}

export interface ChannelItem {
  id: string;
  name: string;
  genre: string;
  url: string;
  description: string;
}

export interface SongRequest {
  id: string;
  name: string;
  city: string;
  song: string;
  artist: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}
