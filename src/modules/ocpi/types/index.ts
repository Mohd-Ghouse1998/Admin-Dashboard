/**
 * OCPI Types Index
 * 
 * This file exports all OCPI type definitions from the consolidated type files.
 * Use this file when importing multiple OCPI types at once.
 */

// Export types from the main OCPI types file
export * from './ocpiTypes';

// Export CDR types but exclude OCPICDR to avoid conflict
// Use the enhanced OCPICDR from cdr.types.ts directly when needed
export type { CDRQueryParams, CDRStatistics } from './cdr.types';

// Note: For the OCPICDR type, import it directly from either file depending on your needs:
// import { OCPICDR } from './ocpiTypes'; // Basic version
// import { OCPICDR } from './cdr.types'; // Enhanced version with more fields
