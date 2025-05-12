
import { BaseEntity, Coordinates } from './index';

// OCPI specific types
export interface OCPIBaseEntity extends BaseEntity {
  last_updated?: string;
  publish_to_ocpi?: boolean;
}

// OCPI status types
export type OCPIStatus = 
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'UNAVAILABLE'
  | 'RESERVED'
  | 'CHARGING'
  | 'INOPERATIVE'
  | 'OUTOFORDER'
  | 'PLANNED'
  | 'REMOVED'
  | string;

// OCPI Location
export interface OCPILocation extends OCPIBaseEntity {
  location_id?: string;
  name?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country?: string;
  coordinates?: Coordinates;
  evses?: OCPIEVSE[];
  directions?: string[];
  operator?: OCPIParty;
  owner?: OCPIParty;
  facilities?: string[];
  time_zone?: string;
  opening_times?: OCPIHours;
  charging_when_closed?: boolean;
  images?: OCPIImage[];
  energy_mix?: OCPIEnergyMix;
  status?: OCPIStatus;
}

// OCPI EVSE
export interface OCPIEVSE extends OCPIBaseEntity {
  evse_id?: string;
  uid?: string;
  location?: string | number;
  status?: OCPIStatus;
  connectors?: OCPIConnector[];
  floor_level?: string;
  coordinates?: Coordinates;
  physical_reference?: string;
  directions?: string[];
}

// OCPI Connector 
export interface OCPIConnector extends OCPIBaseEntity {
  connector_id?: string;
  evse?: string | number;
  standard?: string;
  format?: string;
  power_type?: string;
  max_voltage?: number;
  max_amperage?: number;
  max_electric_power?: number;
  tariff_ids?: string[];
  terms_and_conditions?: string;
  status?: OCPIStatus;
}

// OCPI Party
export interface OCPIParty extends Omit<OCPIBaseEntity, 'id'> {
  id?: number;  // Make id optional to match how it's used
  party_id: string; // Required field for party identification
  name: string; // Required field for the party name
  website?: string; // Optional website
  logo?: OCPIImage;
  country_code: string; // Required field for country identification
  roles?: string; // Changed from string[] to string to match form implementation
  status?: 'ACTIVE' | 'INACTIVE' | string;
  user: number; // Required field for the party's owner/creator
}

// OCPI CDR (Charge Detail Record)
export interface OCPICDR extends OCPIBaseEntity {
  cdr_id?: string;
  session_id?: string;
  start_datetime?: string;
  end_datetime?: string;
  duration?: number;
  kwh?: number;
  location?: string;
  evse?: string;
  connector?: string;
  auth_id?: string;
  auth_method?: string;
  total_cost?: number;
  currency?: string;
  token_type?: string;
  tariff_id?: string;
  signature?: string;
}

// OCPI Session
export interface OCPISession extends OCPIBaseEntity {
  session_id?: string;
  start_datetime?: string;
  end_datetime?: string;
  kwh?: number;
  cdr_id?: string;
  location?: string;
  evse?: string;
  connector?: string;
  auth_id?: string;
  auth_method?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'INVALID' | 'PENDING' | string;
}

// OCPI Token
export interface OCPIToken extends OCPIBaseEntity {
  token_id?: string;
  type?: string;
  auth_id?: string;
  visual_number?: string;
  issuer?: string;
  valid?: boolean;
  whitelist?: 'ALLOWED' | 'DENIED' | 'ALLOWED_OFFLINE' | string;
  contract_id?: string;
}

// OCPI supporting types
export interface OCPIImage {
  url: string;
  thumbnail?: string;
  category: string;
  type: string;
  width?: number;
  height?: number;
}

export interface OCPIHours {
  regular_hours?: Array<{
    weekday: number;
    period_begin: string;
    period_end: string;
  }>;
  exceptional_openings?: Array<{
    period_begin: string;
    period_end: string;
  }>;
  exceptional_closings?: Array<{
    period_begin: string;
    period_end: string;
  }>;
}

export interface OCPIEnergyMix {
  is_green_energy: boolean;
  energy_sources?: Array<{
    source: string;
    percentage: number;
  }>;
  environ_impact?: Array<{
    category: string;
    amount: number;
  }>;
  supplier_name?: string;
  energy_product_name?: string;
}
