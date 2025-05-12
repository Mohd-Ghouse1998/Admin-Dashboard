import axiosInstance from '@/api/axios';
import axios from 'axios';

/**
 * Cache mechanism for the OCPI token to avoid repeated API calls
 */
let cachedToken: string | null = null;

export enum OcpiTokenErrorType {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  SERVER_ERROR = 'SERVER_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface OcpiTokenError {
  type: OcpiTokenErrorType;
  message: string;
}

/**
 * Fetches and caches the OCPI token for the current admin/staff user.
 * Returns the cached token if already fetched.
 * @returns OCPI token string or throws an error with details
 */
export async function getOcpiToken(): Promise<string> {
  try {
    // Log cache status
    if (cachedToken) {
      console.log('[OCPI Auth] Using cached token:', cachedToken.substring(0, 8) + '...');
      return cachedToken;
    }
    
    console.log('[OCPI Auth] Fetching fresh OCPI token...');
    const { data } = await axiosInstance.get('/api/ocpi/active-token/');
    cachedToken = data.token;
    
    // Log the fetched token (truncated for security)
    console.log('[OCPI Auth] Received token:', cachedToken ? (cachedToken.substring(0, 8) + '...') : 'NULL/EMPTY');
    
    if (!cachedToken || cachedToken.length < 10) {
      console.warn('[OCPI Auth] Received suspicious token (empty or too short)');
    }
    
    return cachedToken;
  } catch (error) {
    let tokenError: OcpiTokenError;
    
    if (axios.isAxiosError(error) && error.response) {
      // Handle specific error status codes
      switch (error.response.status) {
        case 404:
          tokenError = {
            type: OcpiTokenErrorType.NOT_CONFIGURED,
            message: 'No OCPI party or token configured for this user.'
          };
          break;
        case 401:
        case 403:
          tokenError = {
            type: OcpiTokenErrorType.PERMISSION_ERROR,
            message: 'You do not have permission to access OCPI resources.'
          };
          break;
        case 500:
          tokenError = {
            type: OcpiTokenErrorType.SERVER_ERROR,
            message: 'Server error when fetching OCPI token.'
          };
          break;
        default:
          tokenError = {
            type: OcpiTokenErrorType.UNKNOWN_ERROR,
            message: `Error fetching OCPI token: ${error.response.status}`
          };
      }

      // Log the error for debugging
      console.error('OCPI token fetch error:', {
        status: error.response.status,
        data: error.response.data,
        tokenError
      });
    } else {
      // Handle non-axios errors
      tokenError = {
        type: OcpiTokenErrorType.UNKNOWN_ERROR,
        message: 'Unknown error fetching OCPI token.'
      };
      console.error('OCPI token fetch error (non-axios):', error);
    }
    
    // Just return the structured error for the caller to handle
    // The caller can use toast notifications as needed in UI components
    throw tokenError;
  }
}

/**
 * Clear the cached OCPI token.
 * This should be called when the user logs out or changes roles.
 * @param reason Optional reason for clearing the cache (for debugging)
 */
export function clearOcpiTokenCache(reason?: string): void {
  const wasTokenCached = !!cachedToken;
  cachedToken = null;
  console.log(`[OCPI Auth] Token cache cleared${reason ? ` (${reason})` : ''}, had token: ${wasTokenCached}`);
}
