/**
 * OCPI Command Types
 * Define types and interfaces for Command Management
 */

/**
 * Command Types as defined in OCPI protocol
 */
export enum CommandType {
  RESERVE_NOW = 'RESERVE_NOW',
  START_SESSION = 'START_SESSION',
  STOP_SESSION = 'STOP_SESSION',
  UNLOCK_CONNECTOR = 'UNLOCK_CONNECTOR',
  CANCEL_RESERVATION = 'CANCEL_RESERVATION',
}

/**
 * Status of a command
 */
export enum CommandStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * OCPI Command interface
 */
export interface OCPICommand {
  id: string;
  command_id: string;
  command_type: CommandType;
  status: CommandStatus;
  result?: {
    message?: string;
    error?: string;
    [key: string]: any; // Additional result data
  };
  created_at: string;
  updated_at: string;
  
  // Command target details (at least one of these will be present)
  session_id?: string;
  location_id?: string;
  evse_uid?: string;
  connector_id?: string;
  
  // Additional fields for specific command types
  reservation_id?: string;
  token_uid?: string;
  authorization_reference?: string;
  expiry_date?: string;
}

/**
 * Command filters for listing commands
 */
export interface CommandFilters {
  command_type?: CommandType;
  status?: CommandStatus;
  location_id?: string;
  session_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  // Added for debugging to track which role the request is for
  role?: 'CPO' | 'EMSP';
}

/**
 * Command statistics for dashboard
 */
export interface CommandStatistics {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  by_type: {
    [key in CommandType]?: number;
  };
}

/**
 * Command request interfaces for different command types
 */
export interface ReserveNowRequest {
  location_id: string;
  evse_uid?: string;
  connector_id?: string;
  token_uid: string;
  expiry_date?: string;
  authorization_reference?: string;
}

export interface StartSessionRequest {
  location_id: string;
  evse_uid: string;
  connector_id?: string;
  token_uid: string;
  authorization_reference?: string;
}

export interface StopSessionRequest {
  session_id: string;
}

export interface UnlockConnectorRequest {
  location_id: string;
  evse_uid: string;
  connector_id: string;
}

export interface CancelReservationRequest {
  reservation_id: string;
}

/**
 * Generic command response interface
 */
export interface CommandResponse {
  result: boolean;
  command_id?: string;
  status: CommandStatus;
  message?: string;
  errors?: any[];
}
