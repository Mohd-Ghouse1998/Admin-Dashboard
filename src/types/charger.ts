
export interface Charger {
  id?: string | number;
  charger_id: string;
  name: string;
  vendor: string;
  model: string;
  type: string;
  enabled: boolean;
  price_per_kwh: number;
  address: string;
  coordinates?: { latitude: number; longitude: number } | null;
  charger_commission_group?: string | number | null;
  verified: boolean;
  ocpi_id?: string;
  publish_to_ocpi: boolean;
  status?: string;
  last_heartbeat?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChargerConfig {
  id?: string | number;
  charger: string | number;
  charger_id?: string;
  key: string;
  value: string;
  readonly: boolean;
}

export interface Connector {
  id?: string | number;
  charger: string | number;
  charger_id?: string;
  connector_id: number;
  type: string;
  status: string;
  max_power: number;
  last_status_update?: string;
}

export interface ChargingSession {
  id?: string | number;
  transaction_id: number;
  charger: string | number;
  charger_id?: string;
  connector_id: number;
  id_tag: string;
  start_timestamp: string;
  end_timestamp?: string;
  meter_start: number;
  meter_stop?: number;
  energy_delivered?: number;
  reason?: string;
  status: string;
  cost?: number;
}

export interface MeterValue {
  id?: string | number;
  charger: string | number;
  charger_id?: string;
  connector_id: number;
  transaction_id?: number;
  timestamp: string;
  value: string;
  context: string;
  format: string;
  measurand: string;
  phase?: string;
  location?: string;
  unit: string;
}

export interface IdTag {
  id?: string | number;
  id_tag: string;
  parent_id_tag?: string;
  expiry_date?: string;
  status: string;
  in_transaction?: boolean;
  blocked?: boolean;
  valid?: boolean;
  user?: string | number;
}

export interface RemoteCommandResponse {
  status: 'Accepted' | 'Rejected';
  error?: string;
  transactionId?: number;
  configurationKey?: ChargerConfig[];
}

export interface ChangeAvailabilityParams {
  charger_id: string;
  connector_id: number;
  type: 'Operative' | 'Inoperative';
}

export interface RemoteStartParams {
  charger_id: string;
  connector_id: number;
  id_tag: string;
}

export interface RemoteStopParams {
  charger_id: string;
  transaction_id: number;
}

export interface ResetParams {
  charger_id: string;
  reset_type: 'Soft' | 'Hard';
}

export interface SetConfigParams {
  charger_id: string;
  key: string;
  value: string;
}

export interface TriggerMessageParams {
  charger_id: string;
  requested_message: string;
  connector_id?: number;
}

export interface UpdateFirmwareParams {
  charger_id: string;
  location: string;
  retrieve_date: string;
  retries?: number;
  retry_interval?: number;
}
