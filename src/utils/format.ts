
/**
 * Utility functions for formatting data
 */

// Format a date string or Date object to a readable date
export const formatDate = (date: string | Date | undefined, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

// Format a number as currency
export const formatCurrency = (amount: number | undefined, currency = 'USD') => {
  if (amount === undefined || amount === null) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format a number with specific decimal places
export const formatNumber = (number: number | undefined, decimals = 2) => {
  if (number === undefined || number === null) return '';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Format bytes to a human-readable string (KB, MB, GB)
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Truncate text with ellipsis
export const truncateText = (text: string | undefined, maxLength = 50) => {
  if (!text) return '';
  
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Convert seconds to HH:MM:SS format
export const formatDuration = (seconds: number) => {
  if (!seconds) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return [hours, minutes, remainingSeconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

// Format a phone number to a standard format
export const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Format depending on length
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  // If the number doesn't match known formats, return as is
  return phoneNumber;
};
