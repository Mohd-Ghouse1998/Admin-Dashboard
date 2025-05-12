export enum TokenType {
  RFID = 'RFID',
  APP_USER = 'APP_USER',
  OTHER = 'OTHER'
}

export enum WhitelistType {
  ALWAYS = 'ALWAYS',
  ALLOWED = 'ALLOWED',
  ALLOWED_OFFLINE = 'ALLOWED_OFFLINE',
  NEVER = 'NEVER'
}

export interface OCPIToken {
  id?: number;
  uid: string;
  type: TokenType;
  contract_id: string;
  visual_number?: string;
  issuer: string;
  valid: boolean;
  whitelist?: WhitelistType;
  last_updated: string;
  country_code: string;
  party_id: string;
  auth_id?: string;
  valid_from?: string;
  valid_to?: string;
  created?: string;
}

export interface TokenFilters {
  uid?: string;
  country_code?: string;
  party_id?: string;
  type?: TokenType;
  page?: number;
  page_size?: number;
  search?: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  allowed: boolean;
  token: OCPIToken;
  location?: {
    id: string;
    name: string;
    evse?: {
      uid: string;
      status: string;
    };
  };
}
