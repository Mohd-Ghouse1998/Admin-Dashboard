/**
 * OCPI Tariff Type Definitions
 * Based on OCPI 2.2.1 specification
 */

// Price component types
export type PriceComponentType = 'ENERGY' | 'TIME' | 'FLAT' | 'PARKING_TIME';

// Price component in a tariff element
export interface PriceComponent {
  type: PriceComponentType;
  price: number;
  step_size: number;
  vat?: number;
  unit?: string;
}

// Time restriction for a tariff element
export interface TimeRestriction {
  start_time: string;
  end_time: string;
  day_of_week?: string[];
}

// Restrictions that can be applied to tariff elements
export interface TariffRestrictions {
  time_restrictions?: TimeRestriction[];
  // Other restriction types could be added in future versions
}

// Tariff element - a combination of price components and restrictions
export interface TariffElement {
  price_components: PriceComponent[];
  restrictions?: TariffRestrictions;
}

// Multilingual text for display strings
export interface DisplayText {
  language: string;
  text: string;
}

// Energy source definition
export interface EnergySource {
  source: string;
  percentage: number;
}

// Energy mix information
export interface EnergyMix {
  energy_sources: EnergySource[];
  is_green_energy: boolean;
  supplier_name?: string;
  energy_product_name?: string;
}

// Complete OCPI Tariff structure
export interface OCPITariff {
  id?: string | number;  // Backend ID (not in OCPI spec, but used for API calls)
  party?: string | number; // Reference to party ID
  tariff_id: string;     // OCPI tariff_id (required)
  currency: string;      // ISO 4217 currency code
  elements: TariffElement[]; // Tariff elements with price components
  
  // Optional fields
  energy_mix?: EnergyMix;
  display_text?: DisplayText[];
  tariff_alt_text?: DisplayText[];
  tariff_alt_url?: string;
  min_price?: number;
  max_price?: number;
  start_date_time?: string;
  end_date_time?: string;
  last_updated?: string;
  
  // Additional fields for UI state management
  status?: 'ACTIVE' | 'INACTIVE';
  type?: string;
  
  // Location assignment fields (used in our application but not part of OCPI spec)
  locations?: string[];
  evses?: string[];
}

// Helper type for transforming form data
export interface TariffFormValues {
  tariff_id: string;
  currency: string;
  party?: string | number;
  min_price?: number;
  max_price?: number;
  start_date_time?: string;
  end_date_time?: string;
  tariff_alt_url?: string;
  is_green_energy: boolean;
}

// Simplified tariff type for list views
export interface TariffListItem {
  id: string | number;
  tariff_id: string;
  displayName: string;
  currency: string;
  type?: string;
  status?: string;
  elementCount: number;
  hasTimeRestrictions: boolean;
  isGreenEnergy: boolean;
  languageCount: number;
  validity: {
    start?: string;
    end?: string;
    isActive: boolean;
  };
}
