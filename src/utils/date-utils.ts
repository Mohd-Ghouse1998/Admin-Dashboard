
import { format, parseISO } from "date-fns";

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @param formatStr Optional format string
 */
export const formatDate = (dateString?: string, formatStr: string = "MMM d, yyyy"): string => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Format a date string to a readable date and time format
 * @param dateString ISO date string
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return formatDate(dateString, "MMM d, yyyy 'at' h:mm a");
};
