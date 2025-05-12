/**
 * OCPI Type Definitions
 * 
 * This file contains all the type definitions for the OCPI module.
 * It has been consolidated from multiple sources to provide a single source of truth.
 */

// Base entity types
export interface OCPIParty {
  id?: number;
  party_id: string;
  country_code: string;
  name: string;
  website?: string; 
  ocpi_token?: string;
  roles?: string; 
  status?: string;
  user: number;
}

export interface OCPIEndpoint {
  id?: number;
  party: number;
  identifier: string;
  url: string;
  interface: string;
  role: string;
  status?: string;
}

export interface OCPICredential {
  id?: number;
  url: string;
  token: string;
  party_id: string;
  country_code: string;
  status?: string;
}

export interface OCPIVersion {
  id?: number;
  version: string;
  url: string;
}

export interface OCPILocation {
  id?: number;
  country_code: string;
  party_id: string;
  location_id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  evses?: OCPIEVSE[];
}

export interface OCPIEVSE {
  id?: number;
  evse_id: string;
  status: string;
  location: number;
  connectors?: OCPIConnector[];
}

export interface OCPIConnector {
  id?: number;
  connector_id: string;
  standard: string;
  format: string;
  power_type: string;
  max_voltage: number;
  max_amperage: number;
  max_electric_power: number;
  status: string;
  evse: number;
}

export interface OCPISession {
  id?: number;
  session_id: string;
  start_datetime: string;
  end_datetime?: string;
  status: string;
  location: OCPILocation;
  auth_id: string;
  auth_method: string;
  kwh: number;
  total_cost?: number;
}

export interface OCPICDR {
  id?: number;
  cdr_id: string;
  start_datetime: string;
  end_datetime: string;
  session_id: string;
  auth_id: string;
  auth_method: string;
  location: number;
  meter_start: number;
  meter_stop: number;
  currency: string;
  total_cost: number;
  total_energy: number;
  total_time: number;
  status: string;
}

export interface OCPIToken {
  id?: number;
  country_code: string;
  party_id: string;
  token_uid: string;
  token_type: string;
  contract_id: string;
  visual_number?: string;
  issuer?: string;
  group_id?: string;
  valid: boolean;
  whitelist: string;
  last_updated: string;
}

export interface OCPICommand {
  id?: number;
  command_id: string;
  command_type: string;
  response_url: string;
  evse: number;
  connector?: number;
  session?: number;
  status: string;
  result?: string;
}

export interface OCPIChargingProfile {
  id?: number;
  charging_profile_id: string;
  transaction_id?: string;
  stack_level: number;
  profile_type: string;
  charging_profile_kind: string;
  recurrency_kind?: string;
  valid_from: string;
  valid_to?: string;
  evse: number;
  period_start: string;
  period_duration?: number;
  min_charging_rate?: number;
}

export interface OCPITariff {
  id?: number;
  tariff_id: string;
  country_code: string;
  party_id: string;
  currency: string;
  type?: string;
  elements?: any[];
}

// Dashboard types
export interface CPODashboardStats {
  total_locations: number;
  total_evses: number;
  total_connectors: number;
  active_sessions: number;
  total_cdrs: number;
  monthly_revenue: number;
  connected_emsps: number;
  evse_status: {
    available: number;
    charging: number;
    outoforder: number;
    reserved: number;
  };
  connection_status: {
    active: number;
    pending: number;
    failed: number;
  };
  recent_sessions: {
    id: string;
    start_time: string;
    status: string;
    location_name: string;
    evse_id: string;
    kwh: number;
  }[];
}

export interface EMSPDashboardStats {
  active_sessions: number;
  total_cdrs: number;
  monthly_spending: number;
  connected_cpos: number;
  token_count: number;
  available_locations: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data: {
    status: string;
    statistics?: T;
    results?: T[];
  }
}

// Connection types
export interface OCPIConnection {
  id: number;
  party_id: string;
  country_code: string;
  name: string;
  role: string;
  status: string;
  last_updated: string;
}
