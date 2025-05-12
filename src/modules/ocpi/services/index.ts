/**
 * OCPI Services Module
 * 
 * This module provides API services for the OCPI protocol implementation.
 */

// Export our unified API service
import OCPIApiService from './ocpiApiService';

// Main export
export { OCPIApiService };

// Backward compatibility aliases
const CommandApiService = {
  emsp: OCPIApiService.emsp.commands,
  cpo: OCPIApiService.cpo.commands
};

const SessionApiService = {
  getSessions: (params?: any) => OCPIApiService.cpo.sessions.getAll(params),
  getSessionStats: (params?: any) => OCPIApiService.cpo.sessions.getStatistics(params),
  commands: {
    stopSession: (sessionId: string) => OCPIApiService.cpo.commands.stopSession({ session_id: sessionId }),
    unlockConnector: (locationId: string, evseUid: string, connectorId: string) => 
      OCPIApiService.cpo.commands.unlockConnector({ location_id: locationId, evse_uid: evseUid, connector_id: connectorId })
  }
};

const TokenApiService = {
  cpo: OCPIApiService.cpo.tokens,
  emsp: OCPIApiService.emsp.tokens
};

const CDRApiService = {
  cpo: OCPIApiService.cpo.cdrs,
  emsp: OCPIApiService.emsp.cdrs,
  getStatistics: (params?: any) => OCPIApiService.cpo.cdrs.getStatistics(params),
  exportCDRs: (params?: any) => OCPIApiService.cpo.cdrs.export(params),
  generateInvoice: (id: string | number) => OCPIApiService.cpo.cdrs.generateInvoice(id)
};

// Ensure backward compatibility for any components that directly import these
export { CommandApiService, SessionApiService, TokenApiService, CDRApiService };

// Re-export all types from the types directory
export * from '../types/ocpiTypes';

/**
 * MIGRATION GUIDE
 * 
 * 1. Replace useRoleBasedApiService with OCPIApiService import:
 *    - Before: import { useRoleBasedApiService } from '../services';
 *    - After:  import { OCPIApiService } from '../services';
 * 
 * 2. Update API calls in your components:
 *    - Before: const { get } = useRoleBasedApiService();
 *             const response = await get('endpoint');
 *    - After:  const response = await OCPIApiService.cpo.endpoint.method();
 *             or
 *             const response = await OCPIApiService.emsp.endpoint.method();
 *             or
 *             const response = await OCPIApiService.common.endpoint.method();
 * 
 * 3. Refer to the OCPIApiService implementation for the full API reference
 */
