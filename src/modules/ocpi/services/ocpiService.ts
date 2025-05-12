
import axios from 'axios';
import { apiService } from '../lib/api';

// Base types for OCPI entities
export interface OCPIParty {
  id?: number;
  party_id: string;
  country_code: string;
  name: string;
  website?: string; // Optional website
  ocpi_token?: string;
  roles?: string; // Changed from roles: string to roles?: string to match implementation
  status?: string;
  user: number;
}

export interface OCPIEndpoint {
  id?: number;
  party: number;
  identifier: string;
  role: string;
  url: string;
  version: string;
  status: string;
}

export interface OCPICredential {
  id?: number;
  token: string;
  url: string;
  roles: Array<{
    role: string;
    business_details: any;
    party_id: string;
    country_code: string;
  }>;
}

export interface OCPIVersion {
  id?: number;
  party: number;
  version: string;
  url: string;
  status: string;
}

export interface OCPILocation {
  id?: number;
  party: number;
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
  time_zone: string;
  publish: boolean;
  status: string;
}

export interface OCPIEVSE {
  id?: number;
  uid?: string;
  evse_id: string;
  status: string;
  location: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  last_updated?: string;
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
  last_updated?: string;
}

export interface OCPISession {
  id?: number;
  party: number;
  country_code: string;
  party_id: string;
  session_id: string;
  start_datetime: string;
  end_datetime?: string;
  kwh: number;
  auth_id: string;
  auth_method: string;
  location_id: string;
  evse_uid: string;
  connector_id: string;
  meter_id: string;
  currency: string;
  status: string;
  location: number;
  evse: number;
  connector: number;
}

export interface OCPICDR {
  id?: number;
  party?: number;
  cdr_id: string;
  session_id: string;
  start_datetime: string;
  end_datetime: string;
  kwh: number;
  auth_id: string;
  auth_method: string;
  location: number;
  evse: number;
  connector: number;
  meter_id: string;
  currency: string;
  charging_periods: any[];
  total_cost: number;
  status: string;
}

export interface OCPIToken {
  id?: number;
  party: number;
  country_code: string;
  party_id: string;
  token_uid: string;
  token_type: string;
  auth_id: string;
  visual_number: string;
  issuer: string;
  valid: boolean;
  whitelist: string;
  last_updated: string;
}

export interface OCPICommand {
  id?: number;
  command_id: string;
  command_type: string;
  party: number;
  response_url?: string;
  evse_uid?: string;
  location_id?: string;
  token?: number;
  connector_id?: string;
}

export interface OCPIChargingProfile {
  id?: number;
  party: number;
  profile_id: string;
  active: boolean;
  charging_rate_unit: string;
  min_charging_rate?: number;
  start_date_time: string;
  end_date_time?: string;
  duration?: number;
  charging_profile_kind: string;
  charging_profile_purpose: string;
  stack_level: number;
  charging_profile_periods: Array<{
    start_period: number;
    limit: number;
    number_phases?: number;
  }>;
  session?: number;
  evse?: number;
  connector?: number;
}

export interface OCPITariff {
  id?: number;
  party: number;
  country_code: string;
  party_id: string;
  tariff_id: string;
  currency: string;
  type: string;
  elements: Array<{
    price_components: Array<{
      type: string;
      price: number;
      step_size: number;
    }>;
  }>;
  start_date_time?: string;
  end_date_time?: string;
  energy_mix?: {
    is_green_energy: boolean;
    energy_sources: Array<{
      source: string;
      percentage: number;
    }>;
  };
}

class OCPIService {
  // Base endpoint for OCPI APIs - Updated as per requirements
  private BASE_URL = '/ocpi/api';

  // Parties
  async getParties() {
    return apiService.get(`${this.BASE_URL}/parties/`);
  }

  async getParty(id: number) {
    return apiService.get(`${this.BASE_URL}/parties/${id}/`);
  }

  async createParty(party: OCPIParty) {
    return apiService.post(`${this.BASE_URL}/parties/`, party);
  }

  async updateParty(id: number, party: OCPIParty) {
    return apiService.put(`${this.BASE_URL}/parties/${id}/`, party);
  }

  async deleteParty(id: number) {
    return apiService.delete(`${this.BASE_URL}/parties/${id}/`);
  }
  
  async generateToken(id: number) {
    return apiService.post(`${this.BASE_URL}/parties/${id}/generate_token/`);
  }

  // Endpoints
  async getEndpoints() {
    return apiService.get(`${this.BASE_URL}/endpoints/`);
  }

  async getEndpoint(id: number) {
    return apiService.get(`${this.BASE_URL}/endpoints/${id}/`);
  }

  async createEndpoint(endpoint: OCPIEndpoint) {
    return apiService.post(`${this.BASE_URL}/endpoints/`, endpoint);
  }

  async updateEndpoint(id: number, endpoint: OCPIEndpoint) {
    return apiService.put(`${this.BASE_URL}/endpoints/${id}/`, endpoint);
  }

  async deleteEndpoint(id: number) {
    return apiService.delete(`${this.BASE_URL}/endpoints/${id}/`);
  }

  // Credentials
  async getCredentials() {
    return apiService.get(`${this.BASE_URL}/credentials/`);
  }

  async getCredential(id: number) {
    return apiService.get(`${this.BASE_URL}/credentials/${id}/`);
  }

  async createCredential(credential: OCPICredential) {
    return apiService.post(`${this.BASE_URL}/credentials/`, credential);
  }

  async updateCredential(id: number, credential: OCPICredential) {
    return apiService.put(`${this.BASE_URL}/credentials/${id}/`, credential);
  }

  async deleteCredential(id: number) {
    return apiService.delete(`${this.BASE_URL}/credentials/${id}/`);
  }
  
  async generateRegistrationTokens(id: number) {
    return apiService.post(`${this.BASE_URL}/credentials/${id}/generate_tokens/`);
  }

  // Versions
  async getVersions() {
    return apiService.get(`${this.BASE_URL}/versions/`);
  }

  async getVersion(id: number) {
    return apiService.get(`${this.BASE_URL}/versions/${id}/`);
  }

  async createVersion(version: OCPIVersion) {
    return apiService.post(`${this.BASE_URL}/versions/`, version);
  }

  async updateVersion(id: number, version: OCPIVersion) {
    return apiService.put(`${this.BASE_URL}/versions/${id}/`, version);
  }

  async deleteVersion(id: number) {
    return apiService.delete(`${this.BASE_URL}/versions/${id}/`);
  }

  // Locations
  async getLocations() {
    return apiService.get(`${this.BASE_URL}/locations/`);
  }

  async getLocation(id: number) {
    return apiService.get(`${this.BASE_URL}/locations/${id}/`);
  }

  async createLocation(location: OCPILocation) {
    return apiService.post(`${this.BASE_URL}/locations/`, location);
  }

  async updateLocation(id: number, location: OCPILocation) {
    return apiService.put(`${this.BASE_URL}/locations/${id}/`, location);
  }

  async deleteLocation(id: number) {
    return apiService.delete(`${this.BASE_URL}/locations/${id}/`);
  }

  // EVSEs
  async getEVSEs() {
    return apiService.get(`${this.BASE_URL}/evses/`);
  }

  async getEVSE(id: number) {
    return apiService.get(`${this.BASE_URL}/evses/${id}/`);
  }

  async getEVSEsByLocation(locationId: number) {
    return apiService.get(`${this.BASE_URL}/locations/${locationId}/evses/`);
  }

  async createEVSE(evse: OCPIEVSE) {
    return apiService.post(`${this.BASE_URL}/evses/`, evse);
  }

  async updateEVSE(id: number, evse: OCPIEVSE) {
    return apiService.put(`${this.BASE_URL}/evses/${id}/`, evse);
  }

  async deleteEVSE(id: number) {
    return apiService.delete(`${this.BASE_URL}/evses/${id}/`);
  }

  // Connectors
  async getConnectors() {
    return apiService.get(`${this.BASE_URL}/connectors/`);
  }

  async getConnector(id: number) {
    return apiService.get(`${this.BASE_URL}/connectors/${id}/`);
  }

  async getConnectorsByEVSE(evseId: number) {
    return apiService.get(`${this.BASE_URL}/evses/${evseId}/connectors/`);
  }

  async createConnector(connector: OCPIConnector) {
    return apiService.post(`${this.BASE_URL}/connectors/`, connector);
  }

  async updateConnector(id: number, connector: OCPIConnector) {
    return apiService.put(`${this.BASE_URL}/connectors/${id}/`, connector);
  }

  async deleteConnector(id: number) {
    return apiService.delete(`${this.BASE_URL}/connectors/${id}/`);
  }

  // Sessions
  async getSessions() {
    return apiService.get(`${this.BASE_URL}/sessions/`);
  }

  async getSession(id: number) {
    return apiService.get(`${this.BASE_URL}/sessions/${id}/`);
  }

  async createSession(session: OCPISession) {
    return apiService.post(`${this.BASE_URL}/sessions/`, session);
  }

  async updateSession(id: number, session: OCPISession) {
    return apiService.put(`${this.BASE_URL}/sessions/${id}/`, session);
  }

  async deleteSession(id: number) {
    return apiService.delete(`${this.BASE_URL}/sessions/${id}/`);
  }
  
  async sendCDRForSessions() {
    return apiService.post(`${this.BASE_URL}/sessions/send_cdr/`);
  }

  // CDRs
  async getCDRs() {
    return apiService.get(`${this.BASE_URL}/cdrs/`);
  }

  async getCDR(id: number) {
    return apiService.get(`${this.BASE_URL}/cdrs/${id}/`);
  }

  async createCDR(cdr: OCPICDR) {
    return apiService.post(`${this.BASE_URL}/cdrs/`, cdr);
  }

  async updateCDR(id: number, cdr: OCPICDR) {
    return apiService.put(`${this.BASE_URL}/cdrs/${id}/`, cdr);
  }

  async deleteCDR(id: number) {
    return apiService.delete(`${this.BASE_URL}/cdrs/${id}/`);
  }
  
  async resendCDR(id: number) {
    return apiService.post(`${this.BASE_URL}/cdrs/${id}/resend/`);
  }
  
  async getCDRSummary() {
    return apiService.get(`${this.BASE_URL}/cdrs/summary/`);
  }

  // Tokens
  async getTokens() {
    return apiService.get(`${this.BASE_URL}/tokens/`);
  }

  async getToken(id: number) {
    return apiService.get(`${this.BASE_URL}/tokens/${id}/`);
  }

  async createToken(token: OCPIToken) {
    return apiService.post(`${this.BASE_URL}/tokens/`, token);
  }

  async updateToken(id: number, token: OCPIToken) {
    return apiService.put(`${this.BASE_URL}/tokens/${id}/`, token);
  }

  async deleteToken(id: number) {
    return apiService.delete(`${this.BASE_URL}/tokens/${id}/`);
  }
  
  async toggleTokenValid(id: number) {
    return apiService.post(`${this.BASE_URL}/tokens/${id}/toggle_valid/`);
  }
  
  async toggleTokenWhitelist(id: number) {
    return apiService.post(`${this.BASE_URL}/tokens/${id}/toggle_whitelist/`);
  }

  // Commands
  async getCommands() {
    return apiService.get(`${this.BASE_URL}/commands/`);
  }

  async getCommand(id: number) {
    return apiService.get(`${this.BASE_URL}/commands/${id}/`);
  }

  async createCommand(command: OCPICommand) {
    return apiService.post(`${this.BASE_URL}/commands/`, command);
  }

  async updateCommand(id: number, command: OCPICommand) {
    return apiService.put(`${this.BASE_URL}/commands/${id}/`, command);
  }

  async deleteCommand(id: number) {
    return apiService.delete(`${this.BASE_URL}/commands/${id}/`);
  }
  
  async retryCommand(id: number) {
    return apiService.post(`${this.BASE_URL}/commands/${id}/retry_command/`);
  }

  // Charging Profiles
  async getChargingProfiles() {
    return apiService.get(`${this.BASE_URL}/charging-profiles/`);
  }

  async getChargingProfile(id: number) {
    return apiService.get(`${this.BASE_URL}/charging-profiles/${id}/`);
  }

  async createChargingProfile(profile: OCPIChargingProfile) {
    return apiService.post(`${this.BASE_URL}/charging-profiles/`, profile);
  }

  async updateChargingProfile(id: number, profile: OCPIChargingProfile) {
    return apiService.put(`${this.BASE_URL}/charging-profiles/${id}/`, profile);
  }

  async deleteChargingProfile(id: number) {
    return apiService.delete(`${this.BASE_URL}/charging-profiles/${id}/`);
  }
  
  async toggleChargingProfileActive(id: number) {
    return apiService.post(`${this.BASE_URL}/charging-profiles/${id}/toggle_active/`);
  }

  // Tariffs
  async getTariffs() {
    return apiService.get(`${this.BASE_URL}/tariffs/`);
  }

  async getTariff(id: number) {
    return apiService.get(`${this.BASE_URL}/tariffs/${id}/`);
  }

  async createTariff(tariff: OCPITariff) {
    return apiService.post(`${this.BASE_URL}/tariffs/`, tariff);
  }

  async updateTariff(id: number, tariff: OCPITariff) {
    return apiService.put(`${this.BASE_URL}/tariffs/${id}/`, tariff);
  }

  async deleteTariff(id: number) {
    return apiService.delete(`${this.BASE_URL}/tariffs/${id}/`);
  }
  
  // EMSP-Specific APIs
  async getEMSPLocations() {
    return apiService.get(`${this.BASE_URL}/emsp/locations/`);
  }
}

export const ocpiService = new OCPIService();
