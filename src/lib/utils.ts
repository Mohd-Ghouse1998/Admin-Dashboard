
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error(`Error formatting currency ${currency}:`, error);
    return `${amount} ${currency}`;
  }
};

/**
 * Formats a date string into a readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Formats a datetime string into a readable format with time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text && text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }
  return text;
}
