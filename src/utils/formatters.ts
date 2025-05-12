
import { format, isValid, parseISO } from "date-fns";
import { tokens } from "@/styles/tokens";

// Format date
export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, "MMM d, yyyy") : "N/A";
  } catch (error) {
    console.error("Date formatting error:", error);
    return "N/A";
  }
};

// Format date and time
export const formatDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, "MMM d, yyyy h:mm a") : "N/A";
  } catch (error) {
    console.error("DateTime formatting error:", error);
    return "N/A";
  }
};

// Format phone number consistently - handles a variety of input formats
export const formatPhoneNumber = (phoneNumber?: string | null): string => {
  if (!phoneNumber) return "N/A";
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    // Format as (XXX) XXX-XXXX for US numbers
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length > 10) {
    // For international numbers with country code
    return `+${cleaned.slice(0, cleaned.length-10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  // Return original format if we can't parse it
  return phoneNumber;
};

// Format currency with appropriate symbol and decimal places
export const formatCurrency = (amount?: number | null, currencyCode: string = 'USD'): string => {
  if (amount === undefined || amount === null) return "N/A";
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
};

// Format coordinates as a string
export const formatCoordinates = (coordinates?: { latitude?: number; longitude?: number } | null): string => {
  if (!coordinates || coordinates.latitude === undefined || coordinates.longitude === undefined) {
    return "N/A";
  }
  
  // Ensure both values are numbers before using toFixed()
  if (typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
    return "N/A";
  }
  
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
};

// Safely format a number with toFixed
export const formatNumber = (value?: number | null, decimals: number = 2): string => {
  if (typeof value !== 'number' || isNaN(value)) return "N/A";
  return value.toFixed(decimals);
};

// Format a number with a unit (e.g., kWh, km)
export const formatNumberWithUnit = (
  value?: number | null, 
  unit: string = '', 
  decimals: number = 2
): string => {
  if (typeof value !== 'number' || isNaN(value)) return "N/A";
  return `${value.toFixed(decimals)}${unit ? ' ' + unit : ''}`;
};

// Truncate text with ellipsis
export const truncateText = (text?: string | null, maxLength = 20): string => {
  if (!text) return "N/A";
  
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Format duration in seconds to a human-readable string
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "N/A";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0) result += `${minutes}m `;
  if (secs > 0 && hours === 0) result += `${secs}s`;
  
  return result.trim() || '0s';
};

// Format permission name for better readability
export const formatPermissionName = (name: string): string => {
  if (!name) return "N/A";
  
  // Remove common prefixes from Django permission names
  const cleanName = name.replace(/^(can_|has_|is_)/, '');
  
  // Replace underscores with spaces and capitalize first letter of each word
  return cleanName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format status for display with proper capitalization
export const formatStatus = (status?: string | null): string => {
  if (!status) return "N/A";
  
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

// Get color for status (for consistent color coding)
export const getStatusVariant = (status?: string | null): "success" | "warning" | "danger" | "info" | "neutral" => {
  if (!status) return "neutral";
  
  const normalizedStatus = status.toLowerCase();
  
  if (['active', 'available', 'completed', 'success', 'operational'].some(s => normalizedStatus.includes(s))) {
    return "success";
  }
  
  if (['warning', 'pending', 'occupied', 'partial', 'in_progress'].some(s => normalizedStatus.includes(s))) {
    return "warning";
  }
  
  if (['error', 'failed', 'unavailable', 'faulted', 'expired', 'rejected', 'cancelled'].some(s => normalizedStatus.includes(s))) {
    return "danger";
  }
  
  if (['info', 'processing', 'reserved'].some(s => normalizedStatus.includes(s))) {
    return "info";
  }
  
  return "neutral";
};
