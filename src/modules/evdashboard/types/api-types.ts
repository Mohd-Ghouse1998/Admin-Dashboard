// Dashboard Overview Types
export interface ConnectorStatusBreakdown {
  status: string;
  count: number;
}

export interface ActiveSessionDetail {
  id: number;
  charger_name: string;
  username: string;
  start_time: string;
  duration_minutes: number;
  // Add any other fields from the actual API response
}

export interface DateFilter {
  date_from: string | null;
  date_to: string | null;
}

export interface DashboardOverview {
  // Existing fields from API response
  total_chargers: number;
  online_chargers: number;
  offline_chargers: number;
  enabled_chargers?: number;
  total_energy: number;
  total_revenue: number;
  active_users?: number;
  connector_status_breakdown?: ConnectorStatusBreakdown[];
  available_connectors?: number;
  in_use_connectors?: number;
  faulted_connectors?: number;
  sessions_today?: number;
  energy_today?: number;
  revenue_today?: number;
  active_sessions_count?: number;
  active_session_details: ActiveSessionDetail[];
  date_filter?: DateFilter;
  
  // Optional fields for backward compatibility
  online_percentage?: number;
  active_sessions?: number;
  total_energy_kwh?: number;
  charger_growth?: number;
  online_growth?: number;
  sessions_growth?: number;
  energy_growth?: number;
  revenue_growth?: number;
  today_sessions?: number;
  today_energy_kwh?: number;
  today_revenue?: number;
  today_sessions_growth?: number;
  today_energy_growth?: number;
  today_revenue_growth?: number;
}

// Status Distribution Types
export interface StatusDistribution {
  status_distribution: ConnectorStatusBreakdown[];
  online_distribution: ConnectorStatusBreakdown[];
  total_chargers: number;
  total_connectors: number;
}

// Map Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ConnectorStats {
  total: number;
  available: number;
  in_use: number;
  faulted: number;
}

export interface ChargerLocation {
  id: number;
  name: string;
  charger_id: string;
  address: string;
  coordinates: Coordinates;
  status: string;
  type: string;
  connectors: ConnectorStats;
  is_online: boolean;
}

export interface MapData {
  charger_locations: ChargerLocation[];
}

// Monthly Chart Types
export interface MonthlyData {
  month: string;
  month_key: string;
  session_count: number;
  total_energy: number;
  total_revenue: number;
}

export interface MonthlyChartData {
  months_requested: number;
  monthly_data: MonthlyData[];
  date_filter?: DateFilter;
}

// Yearly Chart Types
export interface YearlyData {
  year: string;
  total_energy: number;
  session_count: number;
  total_revenue: number;
}

export interface YearlyChartData {
  years_requested: number;
  yearly_data: YearlyData[];
  date_filter?: DateFilter;
}

// Top Sessions Types
export interface TopChargerSession {
  charger_id: string;
  charger_name: string;
  total_sessions: number;
  total_energy: number;
}

export interface TopSessionsData {
  top_chargers: TopChargerSession[];
  date_filter: DateFilter;
}

// Top Revenue Types
export interface TopChargerRevenue {
  charger_id: string;
  charger_name: string;
  total_revenue: number;
  total_sessions: number;
  total_energy: number;
  avg_revenue_per_session: number;
}

export interface TopRevenueData {
  top_chargers: TopChargerRevenue[];
  date_filter: DateFilter;
}

// Sessions Types
export interface SessionData {
  id: number;
  transaction_id: number;
  charger_name: string;
  connector_id: number;
  username: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  energy_kwh: number;
  revenue: number;
  status: string;
}

export interface SessionsResponse {
  sessions: SessionData[];
  total_count: number;
  limit: number;
  date_filter: DateFilter;
}

// Charger Utilization Types
export interface ChargerUtilization {
  charger_id: string;
  name: string;
  location: string;
  is_online: boolean;
  sessions: number;
  energy_delivered: number;
  revenue: number;
  hours_active: number;
  availability_rate: number;
  utilization_rate: number;
  connector_count: number;
  available_connectors: number;
  efficiency: number;
  revenue_per_hour: number;
}

export interface ChargerGroupData {
  count: number;
  energy_delivered: number;
  revenue: number;
  sessions: number;
  hours_active: number;
  utilization_rate: number;
  availability_rate: number;
  connector_count: number;
  available_connectors: number;
  avg_energy_per_charger: number;
  avg_revenue_per_charger: number;
  avg_sessions_per_charger: number;
}

export interface ChargerUtilizationData {
  charger_utilization: ChargerUtilization[];
  time_period: string;
  total_chargers: number;
  sort_by: string;
  date_filter: DateFilter;
  grouped_by?: string;
  groups?: Record<string, ChargerGroupData>;
}
