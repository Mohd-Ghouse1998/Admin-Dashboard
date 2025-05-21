import axiosInstance from '@/api/axios';
import axios from 'axios';

interface TenantValidationResponse {
  is_valid: boolean;
  tenant_id: number;
  name: string;
  schema_name: string;
  is_active: boolean;
  logo: string;
  unfold_site_title: string;
  unfold_site_header: string;
}

/**
 * Gets the tenant domain to use for API calls
 * This handles both local development and production scenarios
 */
export const getTenantDomain = (): string => {
  // Check for tenant domain from URL parameter (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const queryTenantDomain = urlParams.get('tenant_domain');
  if (queryTenantDomain) {
    localStorage.setItem('tenant_domain', queryTenantDomain);
    return queryTenantDomain;
  }
  
  // Check for stored tenant domain in localStorage
  const storedTenantDomain = localStorage.getItem('tenant_domain');
  if (storedTenantDomain) {
    return storedTenantDomain;
  }
  
  // Fall back to current hostname
  return window.location.hostname;
};

/**
 * Validates the tenant domain against the API
 * This is the primary method used during application startup
 * @returns Tenant validation information if valid
 */
export const validateTenantDomain = async (): Promise<TenantValidationResponse | null> => {
  try {
    // Get the tenant domain to validate
    const domainToValidate = getTenantDomain();
    
    console.log('Validating tenant domain:', domainToValidate);
    
    // Create a direct axios instance for this specific API call
    // This ensures we use the correct tenant domain for validation
    const validationApiUrl = `http://${domainToValidate}`;
    console.log(`Using validation API URL: ${validationApiUrl}`);
    
    // Make a direct API call to validate the domain
    const response = await axios.get<TenantValidationResponse>(
      `${validationApiUrl}/api/tenant/validate-domain/?domain=${domainToValidate}`
    );
    
    if (response.data && response.data.is_valid) {
      // Store tenant info for future reference
      localStorage.setItem('tenant_domain', domainToValidate);
      localStorage.setItem('tenant_id', response.data.tenant_id.toString());
      console.log('Valid tenant domain confirmed:', response.data.name);
    } else {
      console.warn('Invalid tenant domain or response:', domainToValidate);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error validating tenant domain:', error);
    return null;
  }
};

/**
 * Validates a specific domain against the tenant API
 * @param domain Domain to validate
 * @returns Tenant validation information if valid
 */
export const validateSpecificDomain = async (domain: string): Promise<TenantValidationResponse | null> => {
  try {
    console.log('Validating specific domain:', domain);
    
    const response = await axiosInstance.get<TenantValidationResponse>(
      `/api/tenant/validate-domain/?domain=${domain}`
    );
    
    console.log('Specific domain validation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error validating specific domain:', error);
    return null;
  }
};
