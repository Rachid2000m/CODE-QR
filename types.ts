export enum QRCodeErrorCorrectionLevel {
  L = 'L',
  M = 'M',
  Q = 'Q',
  H = 'H'
}

export interface QRConfig {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  level: QRCodeErrorCorrectionLevel;
  includeMargin: boolean;
}

export interface HistoryItem extends QRConfig {
  id: string;
  timestamp: number;
  label?: string; // Auto-generated label
}

export interface AIResponse {
  formattedString: string;
  explanation: string;
  type: 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard' | 'geo' | 'event';
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  lastPrompt: string;
}
