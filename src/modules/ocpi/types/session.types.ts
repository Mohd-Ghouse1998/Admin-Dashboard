import { OCPISession, OCPILocation } from './ocpi.types';

/**
 * Enhanced session interface with more detailed information
 * 
 * Note: To avoid type conflicts with OCPISession, this interface no longer extends it directly
 * but instead includes its fields with compatible types
 */
export interface OCPISessionDetail {
  // Extended fields from OCPISession but with compatible types
  id: string | number;  // Can be either string or number depending on context
  party?: number;
  session_id?: string;
  start_datetime?: string;
  end_datetime?: string | null;
  kwh?: number;
  auth_id?: string;
  auth_method?: string;
  location?: any; // Can be either a number or full location object
  evse?: number;
  connector?: number;
  meter_id?: string | null;
  currency?: string;
  charging_periods?: any | null;
  total_cost?: number | null;
  cdr_id?: string;
  status?: string;
  
  // Detail-specific fields
  evse_uid: string;
  connector_id: string;
  location_obj?: OCPILocation; // Renamed to avoid conflict with location property
  meter_values?: OCPIMeterValue[];
  auth_method_details?: {
    type: string;
    value: string;
  };
  pricing?: {
    total_cost?: number;
    currency?: string;
    components: Array<{
      type: string;
      cost: number;
    }>;
  };
  // Properties needed for backward compatibility
  last_updated?: string;  // When the session was last updated
}

/**
 * Meter value for session consumption data
 */
export interface OCPIMeterValue {
  timestamp: string;
  value: number;
  unit: string;
}

/**
 * Session statistics for dashboard
 */
export interface OCPISessionStatistics {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  total_energy: number; // kWh
  total_duration: number; // seconds
  avg_duration: number; // seconds
  avg_energy: number; // kWh
}

/**
 * Command interface for OCPI commands
 */
export interface OCPICommand {
  id: string;
  command_id: string;
  command_type: 'STOP_SESSION' | 'UNLOCK_CONNECTOR' | 'RESERVE_NOW' | 'SET_CHARGING_PROFILE';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  result?: any;
  created_at: string;
  updated_at: string;
  session_id?: string;
  location_id?: string;
  evse_uid?: string;
  connector_id?: string;
}

/**
 * Charging profile for setting charging parameters
 */
export interface ChargingProfile {
  charging_rate_unit: 'W' | 'A';
  min_charging_rate?: number;
  periods: {
    start_period: number; // seconds from start
    limit: number; // in W or A
  }[];
}

/**
 * Session filters for querying sessions
 */
export interface SessionFilters {
  status?: string;
  search?: string;
  locationId?: string;
  startDate?: Date;
  endDate?: Date;
}
