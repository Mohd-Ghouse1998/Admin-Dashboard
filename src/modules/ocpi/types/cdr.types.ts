/**
 * CDR (Charge Detail Records) Types
 * 
 * This file contains type definitions related to OCPI CDRs (Charge Detail Records).
 */

import { OCPILocation } from './ocpiTypes';

export interface OCPICDR {
  id?: number;
  cdr_id: string;
  start_date_time: string;
  end_date_time: string;
  session_id: string;
  auth_id: string;
  auth_method: string;
  location?: OCPILocation | number;
  meter_id?: string;
  currency: string;
  charging_periods?: Array<{
    start_date_time: string;
    dimensions: Array<{
      type: string;
      volume: number;
    }>;
  }>;
  total_cost?: number;
  total_energy?: number;
  total_time?: number;
  total_parking_time?: number;
  remark?: string;
  invoice_reference?: string;
  status?: string;
  last_updated?: string;
}

export interface CDRQueryParams {
  page?: number;
  page_size?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  ordering?: string;
  session_id?: string;
  cdr_id?: string;
  status?: string;
  format?: string;
  location_id?: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
  period?: string;
}

export interface CDRStatistics {
  total_cdrs: number;
  total_energy: number; // kWh
  total_cost: number;
  total_duration: number; // seconds
  avg_duration: number; // seconds
  avg_energy: number; // kWh
  avg_cost: number;
  currency: string;
  by_period?: Array<{
    period: string;
    count: number;
    energy: number;
    cost: number;
  }>;
  by_location?: Array<{
    location_id: string;
    name: string;
    count: number;
    energy: number;
    cost: number;
  }>;
}
