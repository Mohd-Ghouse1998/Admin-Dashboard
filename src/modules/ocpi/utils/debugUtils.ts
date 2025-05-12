import { clearOcpiTokenCache, getOcpiToken } from '../services/ocpiAuthService';
import OCPIApiService from '../services/ocpiApiService';
import axiosInstance from '@/api/axios';

/**
 * OCPI Debug Utility
 * 
 * This utility provides enhanced debugging capabilities for OCPI token authentication
 * to help diagnose "No credential found for token" errors and similar issues.
 */
export const OCPIDebugUtils = {
  /**
   * Run a comprehensive token diagnostic that tests every aspect of OCPI authentication
   * @returns A report of the diagnostic results
   */
  async runTokenDiagnostic(): Promise<{ success: boolean; report: string[]; details: any }> {
    const report: string[] = [];
    const details: any = {};
    let success = true;
    
    try {
      console.group('🔍 OCPI Token Diagnostic');
      report.push('Starting OCPI token diagnostic...');
      
      // Step 1: Check current role
      report.push('Step 1: Checking current OCPI role...');
      let currentRole: string | null = null;
      try {
        const roleResponse = await axiosInstance.get('/api/ocpi/user-role/');
        currentRole = roleResponse.data.role;
        details.role = currentRole;
        report.push(`✅ Current role: ${currentRole || 'Not set'}`);
      } catch (error: any) {
        success = false;
        details.roleError = error.response?.data || error.message;
        report.push(`❌ Error fetching current role: ${error.response?.status || 'Unknown error'}`);
        report.push(`   Message: ${error.response?.data?.detail || error.message}`);
      }
      
      // Step 2: Clear token cache to ensure fresh token
      report.push('Step 2: Clearing token cache...');
      clearOcpiTokenCache('diagnostic');
      report.push('✅ Token cache cleared');
      
      // Step 3: Fetch a fresh token
      report.push('Step 3: Fetching a fresh OCPI token...');
      let token: string | null = null;
      try {
        token = await getOcpiToken();
        details.token = token ? { 
          length: token.length,
          prefix: token.substring(0, 6) + '...',
          isValid: token.length > 10
        } : null;
        
        if (token && token.length > 10) {
          report.push(`✅ Token received successfully (${token.substring(0, 6)}...)`);
        } else {
          success = false;
          report.push(`❌ Received invalid or too short token: ${token || 'null'}`);
        }
      } catch (error: any) {
        success = false;
        details.tokenError = error.response?.data || error.message;
        report.push(`❌ Error fetching token: ${error.response?.status || 'Unknown error'}`);
        report.push(`   Message: ${error.response?.data?.detail || error.message}`);
        
        // Special case for 404 - likely means no OCPI party configured
        if (error.response?.status === 404) {
          report.push('   LIKELY CAUSE: No OCPI party configured for this user/role.');
          report.push('   SOLUTION: Set up an OCPI party in the backend for this role.');
        }
      }
      
      // Step 4: Test token with a simple command endpoint
      if (token) {
        report.push('Step 4: Testing token with a command endpoint...');
        
        // Determine endpoint based on role
        const endpointPath = currentRole === 'EMSP' 
          ? '/api/ocpi/emsp/commands/' 
          : '/api/ocpi/cpo/commands/';
        
        try {
          const response = await axiosInstance.get(endpointPath, {
            headers: { Authorization: `Token ${token}` }
          });
          
          details.commandResponse = {
            status: response.status,
            count: response.data?.count,
            hasResults: Array.isArray(response.data?.results)
          };
          
          report.push(`✅ Command endpoint test successful! Status: ${response.status}`);
          report.push(`   Results: Found ${response.data?.count || 0} commands`);
        } catch (error: any) {
          success = false;
          details.commandError = error.response?.data || error.message;
          
          report.push(`❌ Error testing token on command endpoint: ${error.response?.status || 'Unknown error'}`);
          report.push(`   Message: ${error.response?.data?.detail || error.message}`);
          
          // The key error we're looking for
          if (error.response?.data?.detail?.includes('No credential found for token')) {
            report.push('   DETECTED "No credential found for token" ERROR!');
            report.push('   LIKELY CAUSES:');
            report.push('   1. Token does not match any credential in the database');
            report.push('   2. The token is for a different role than the endpoint');
            report.push('   3. Token may have been rotated in the backend');
            report.push('   SOLUTIONS:');
            report.push('   1. Ensure the OCPI role matches the endpoint (CPO vs EMSP)');
            report.push('   2. Check backend logs for specific token rejection reason');
            report.push('   3. Verify the OCPI party and credentials are properly configured');
          }
        }
      } else {
        report.push('Step 4: Skipping command endpoint test (no valid token)');
      }
      
      // Step 5: Backend synchronization check
      report.push('Step 5: Checking backend synchronization...');
      try {
        const syncResponse = await axiosInstance.get('/api/ocpi/sync/status/');
        details.syncStatus = syncResponse.data;
        
        const lastSync = syncResponse.data?.last_sync 
          ? new Date(syncResponse.data.last_sync) 
          : null;
          
        if (lastSync) {
          const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
          report.push(`✅ Last sync: ${lastSync.toLocaleString()}`);
          
          if (hoursSinceSync > 24) {
            report.push(`⚠️ Warning: Last sync was more than 24 hours ago (${Math.round(hoursSinceSync)} hours)`);
          }
        } else {
          report.push('⚠️ Warning: No synchronization found');
        }
      } catch (error: any) {
        report.push(`⚠️ Could not check sync status: ${error.response?.status || error.message}`);
      }
      
      // Final diagnostics summary
      if (success) {
        report.push('✅ OCPI Token Diagnostic completed successfully.');
        report.push('Your token authentication is working correctly!');
      } else {
        report.push('❌ OCPI Token Diagnostic failed.');
        report.push('See the details above for specific issues and solutions.');
      }
      
      console.groupEnd();
      return { success, report, details };
    } catch (error: any) {
      report.push(`❌ Unexpected error during diagnostics: ${error.message}`);
      console.error('Diagnostic error:', error);
      console.groupEnd();
      return { success: false, report, details: { error: error.message } };
    }
  },
  
  /**
   * Tests a specific OCPI command endpoint with detailed logging
   * @param role The OCPI role (CPO/EMSP)
   * @param commandEndpoint The command endpoint to test
   * @param data Any data to send with the command
   * @returns Detailed diagnostics about the command execution
   */
  async testCommandEndpoint(role: 'CPO' | 'EMSP', commandEndpoint: string, data?: any): Promise<any> {
    console.group(`🔍 Testing ${role} command: ${commandEndpoint}`);
    try {
      // Clear any cached token to ensure a fresh test
      clearOcpiTokenCache('endpoint test');
      console.log(`Token cache cleared for ${role} command test`);
      
      // Get a fresh token
      const token = await getOcpiToken();
      console.log(`Retrieved token: ${token ? (token.substring(0, 6) + '...') : 'NULL/EMPTY'}`);
      
      // If no specific endpoint is provided, test the main commands endpoint
      const endpoint = commandEndpoint || `/api/ocpi/${role.toLowerCase()}/commands/`;
      console.log(`Testing endpoint: ${endpoint}`);
      
      // Execute request
      const method = data ? 'post' : 'get';
      const config = { headers: { Authorization: `Token ${token}` } };
      console.log(`Making ${method.toUpperCase()} request with Authorization: Token ${token?.substring(0, 6)}...`);
      
      const response = data
        ? await axiosInstance.post(endpoint, data, config)
        : await axiosInstance.get(endpoint, config);
      
      console.log('Command test successful!', response.data);
      console.groupEnd();
      return {
        success: true,
        endpoint,
        status: response.status,
        data: response.data
      };
    } catch (error: any) {
      console.error('Command test failed:', error.response?.data || error);
      console.log(`Error status: ${error.response?.status || 'N/A'}`);
      console.log(`Error details: ${error.response?.data?.detail || error.message}`);
      console.groupEnd();
      return {
        success: false,
        endpoint: commandEndpoint,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
    }
  }
};

/**
 * Exports a debug function that can be called from browser console
 * for easy troubleshooting by developers
 */
// @ts-ignore - Making this available on window for debugging
window.debugOcpi = async () => {
  console.log('Running OCPI diagnostic...');
  const result = await OCPIDebugUtils.runTokenDiagnostic();
  console.log('Diagnostic complete:');
  console.log(result.report.join('\n'));
  return result;
};

export default OCPIDebugUtils;
