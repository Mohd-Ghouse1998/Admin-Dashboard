
import { BaseEntity } from './index';

// Charger types
export interface Charger extends BaseEntity {
  charger_id?: string;
  name?: string;
  vendor?: string;
  model?: string;
  type?: string;
  serial_number?: string;
  firmware_version?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status?: ChargerStatus;
  enabled?: boolean;
  publish_to_ocpi?: boolean;
  price_per_kwh?: number;
  last_heartbeat?: string;
  created_at?: string;
  updated_at?: string;
  commission_group?: string | number;
  active_connector_id?: string | number;
  connectors?: Connector[];
}

// Connector types
export interface Connector extends BaseEntity {
  connector_id?: string;
  charger?: string | number;
  type?: string;
  standard?: string;
  format?: string;
  power_type?: string;
  max_voltage?: number;
  max_amperage?: number;
  max_electric_power?: number;
  status?: ConnectorStatus;
  enabled?: boolean;
  ocpp_reference?: string;
  last_status_update?: string;
  current_transaction_id?: string | number | null;
}

// Charging Session types
export interface ChargingSession extends BaseEntity {
  session_id?: string;
  transaction_id?: number;
  connector?: string | number;
  charger?: string | number;
  auth_id?: string;
  auth_type?: string;
  start_time?: string;
  end_time?: string | null;
  start_value?: number;
  end_value?: number | null;
  session_status?: SessionStatus;
  total_energy?: number;
  total_cost?: number;
  currency?: string;
  meter_values?: MeterValue[];
  created_at?: string;
  updated_at?: string;
}

// Meter Value types
export interface MeterValue extends BaseEntity {
  timestamp?: string;
  charger?: string | number;
  connector?: string | number;
  transaction_id?: number | null;
  value?: number;
  unit?: string;
  measurand?: string;
  phase?: string | null;
  location?: string;
  context?: string;
  format?: string;
}

// ID Tag types
export interface IdTag extends BaseEntity {
  tag_id?: string;
  user?: string | number;
  status?: IdTagStatus;
  expiry_date?: string | null;
  parent_tag_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Remote Command types
export interface RemoteCommand extends BaseEntity {
  command_id?: string;
  charger?: string | number;
  command_type?: CommandType;
  parameters?: Record<string, any>;
  status?: CommandStatus;
  response?: Record<string, any>;
  created_at?: string;
  completed_at?: string | null;
}

// Charger Config types
export interface ChargerConfig extends BaseEntity {
  charger?: string | number;
  key?: string;
  value?: string;
  readable?: boolean;
  writable?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Enums as string literal types
export type ChargerStatus = 
  | 'Available'
  | 'Preparing'
  | 'Charging'
  | 'SuspendedEVSE'
  | 'SuspendedEV'
  | 'Finishing'
  | 'Reserved'
  | 'Unavailable'
  | 'Faulted'
  | string;

export type ConnectorStatus = 
  | 'Available'
  | 'Occupied'
  | 'Reserved'
  | 'Unavailable'
  | 'Faulted'
  | string;

export type SessionStatus = 
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Invalid'
  | string;

export type IdTagStatus = 
  | 'Accepted'
  | 'Blocked'
  | 'Expired'
  | 'Invalid'
  | string;

export type CommandType = 
  | 'Reset'
  | 'ClearCache'
  | 'ChangeAvailability'
  | 'UnlockConnector'
  | 'RemoteStartTransaction'
  | 'RemoteStopTransaction'
  | 'UpdateFirmware'
  | 'GetConfiguration'
  | 'ChangeConfiguration'
  | 'SetChargingProfile'
  | string;

export type CommandStatus = 
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Failed'
  | 'Rejected'
  | string;

// Parameter types for commands
export interface ChangeAvailabilityParams {
  connector_id?: number | string;
  type: 'Operative' | 'Inoperative';
}
