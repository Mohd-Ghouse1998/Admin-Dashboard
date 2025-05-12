
/**
 * Utility functions to safely extract data from various API response formats
 */

/**
 * Safely extracts an array from various API response formats including:
 * - Direct array response
 * - Paginated response with results property
 * - GeoJSON response with features array
 * 
 * @param data Any API response data
 * @param defaultValue Default value to return if extraction fails
 * @returns Extracted array or defaultValue if extraction fails
 */
export const extractArrayFromResponse = <T>(data: any, defaultValue: T[] = []): T[] => {
  if (!data) return defaultValue;
  
  // Case 1: Direct array response
  if (Array.isArray(data)) {
    return data;
  }
  
  // Case 2: Paginated response with results property
  if (data.results) {
    // Case 2.1: results is directly an array
    if (Array.isArray(data.results)) {
      return data.results;
    }
    
    // Case 2.2: GeoJSON format with features array
    if (data.results.features && Array.isArray(data.results.features)) {
      return data.results.features.map((feature: any) => feature.properties);
    }
    
    // Case 2.3: results is an object with type 'FeatureCollection'
    if (data.results.type === 'FeatureCollection' && data.results.features) {
      return data.results.features.map((feature: any) => feature.properties);
    }
  }
  
  // Case 3: Direct GeoJSON response
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    return data.features.map((feature: any) => feature.properties);
  }
  
  console.error('Unknown API response format:', data);
  return defaultValue;
};

/**
 * Safely extracts a single item from various API response formats
 * 
 * @param data Any API response data
 * @param defaultValue Default value to return if extraction fails
 * @returns Extracted item or defaultValue if extraction fails
 */
export const extractItemFromResponse = <T>(data: any, defaultValue: T | null = null): T | null => {
  if (!data) return defaultValue;
  
  // Direct object response
  if (!Array.isArray(data) && typeof data === 'object') {
    // Check if it's a wrapped response
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }
    
    // GeoJSON feature
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
      return data.features[0].properties;
    }
    
    // Direct object that might be the item
    if (!data.results && !data.features) {
      return data;
    }
  }
  
  return defaultValue;
};

/**
 * Creates a safe value for Select.Item components
 * Ensures the value is a non-empty string as required by radix-ui select
 * 
 * @param value The value to make safe for Select.Item
 * @returns A non-empty string value
 */
export const createSafeSelectValue = (value: string | number | undefined | null): string => {
  // Check for null, undefined, and empty strings
  if (value === undefined || value === null || value === '') {
    return 'none'; // Using 'none' as a fallback value
  }
  
  // Convert to string and ensure it's not empty
  const stringValue = String(value).trim();
  
  // Return a fallback value if empty after trimming
  return stringValue === '' ? 'none' : stringValue;
};

/**
 * Safely checks if an item should be rendered in a select component
 * Prevents rendering items with empty or invalid values that would cause errors
 * 
 * @param value The value to check
 * @returns Boolean indicating if the item should be rendered
 */
export const shouldRenderSelectItem = (value: any): boolean => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

/**
 * Creates a safe display name for UI elements
 * 
 * @param name The name to display
 * @param fallback Fallback text if name is empty
 * @returns A non-empty string for display
 */
export const createSafeDisplayName = (name: string | number | undefined | null, fallback: string = 'Unnamed'): string => {
  if (name === undefined || name === null || String(name).trim() === '') {
    return fallback;
  }
  return String(name);
};
