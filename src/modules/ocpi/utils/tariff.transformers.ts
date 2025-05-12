import { 
  OCPITariff, 
  TariffListItem, 
  DisplayText,
  EnergyMix,
  TariffElement,
  PriceComponent
} from '../types/tariff.types';

/**
 * Transforms tariff data received from the backend into the frontend OCPITariff format
 * @param data The raw data from the API
 * @returns Properly formatted OCPITariff object
 */
export function transformTariffFromBackend(data: any): OCPITariff {
  return {
    id: data.id,
    tariff_id: data.tariff_id || '',
    currency: data.currency || 'EUR',
    elements: data.elements || [],
    energy_mix: data.energy_mix || undefined,
    display_text: data.display_text || [],
    tariff_alt_text: data.tariff_alt_text || [],
    tariff_alt_url: data.tariff_alt_url,
    min_price: data.min_price,
    max_price: data.max_price,
    start_date_time: data.start_date_time,
    end_date_time: data.end_date_time,
    last_updated: data.last_updated,
    status: data.status || 'ACTIVE',
    type: data.type
  };
}

/**
 * Transforms a list of tariffs for efficient table display
 * @param tariffs Array of raw tariff data from the API
 * @returns Array of simplified TariffListItem objects
 */
export function transformTariffsToTableData(tariffs: any[]): TariffListItem[] {
  return tariffs.map(tariff => {
    const displayTexts = tariff.display_text || [];
    
    // Get primary display name (prefer English, then first available)
    const primaryText = displayTexts.find((dt: DisplayText) => dt.language === 'en')?.text || 
                       displayTexts[0]?.text || 
                       tariff.tariff_id || 
                       'Unnamed Tariff';
    
    // Check for green energy in energy mix
    const isGreenEnergy = tariff.energy_mix?.is_green_energy || false;
    
    // Count elements and check for time restrictions
    const elementCount = (tariff.elements || []).length;
    const hasTimeRestrictions = (tariff.elements || []).some(
      (elem: any) => elem.restrictions?.time_restrictions?.length > 0
    );
    
    // Check validity dates
    const now = new Date();
    const startDate = tariff.start_date_time ? new Date(tariff.start_date_time) : null;
    const endDate = tariff.end_date_time ? new Date(tariff.end_date_time) : null;
    const isActive = (!startDate || startDate <= now) && (!endDate || endDate >= now);
    
    return {
      id: tariff.id,
      tariff_id: tariff.tariff_id || '',
      displayName: primaryText,
      currency: tariff.currency || 'EUR',
      type: tariff.type || 'REGULAR',
      status: tariff.status || 'ACTIVE',
      elementCount,
      hasTimeRestrictions,
      isGreenEnergy,
      languageCount: displayTexts.length,
      validity: {
        start: tariff.start_date_time,
        end: tariff.end_date_time,
        isActive
      }
    };
  });
}

/**
 * Transforms legacy tariff structure to OCPI-compliant format
 * @param legacyTariff Legacy tariff object with flattened structure
 * @returns Properly structured OCPITariff
 */
export function transformLegacyTariffToOCPI(legacyTariff: any): OCPITariff {
  // Extract basic fields
  const {
    id,
    name,
    description,
    currency,
    price_components = [],
    start_date,
    end_date,
    locations,
    status,
    type
  } = legacyTariff;

  // Create properly structured elements from price components
  const elements: TariffElement[] = price_components.map((pc: any) => {
    const priceComponent: PriceComponent = {
      type: pc.type,
      price: pc.price,
      step_size: pc.step_size || 1,
      vat: pc.vat
    };

    // Handle time restrictions if present
    const element: TariffElement = {
      price_components: [priceComponent]
    };

    if (pc.time_restriction) {
      element.restrictions = {
        time_restrictions: [{
          start_time: pc.time_restriction.start_time,
          end_time: pc.time_restriction.end_time,
          day_of_week: pc.time_restriction.day_of_week
        }]
      };
    }

    return element;
  });

  // Create display text from name and description
  const displayText: DisplayText[] = [];
  if (name) {
    displayText.push({
      language: 'en',
      text: name
    });
  }

  return {
    id,
    tariff_id: name || id, // Use name as tariff_id for legacy data
    currency,
    elements,
    display_text: displayText,
    start_date_time: start_date,
    end_date_time: end_date,
    status: status || 'ACTIVE',
    type
  };
}

/**
 * Transforms frontend tariff data to the format expected by the backend API
 * @param data OCPITariff object from the frontend
 * @returns Properly formatted object for API submission
 */
export function transformTariffToBackend(data: OCPITariff): any {
  // Create a clean object without frontend-specific fields
  const cleanData = {
    tariff_id: data.tariff_id,
    currency: data.currency,
    elements: data.elements,
    energy_mix: data.energy_mix,
    display_text: data.display_text,
    tariff_alt_text: data.tariff_alt_text,
    tariff_alt_url: data.tariff_alt_url,
    min_price: data.min_price,
    max_price: data.max_price,
    start_date_time: data.start_date_time,
    end_date_time: data.end_date_time,
    status: data.status,
    type: data.type
  };
  
  // Remove undefined values to avoid overwriting with null
  return Object.entries(cleanData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Creates a default empty tariff object
 * @returns Empty OCPITariff with required fields
 */
export function createEmptyTariff(): OCPITariff {
  return {
    tariff_id: '',
    currency: 'EUR',
    elements: [{
      price_components: [{
        type: 'ENERGY',
        price: 0,
        step_size: 1,
      }]
    }],
    display_text: [{ language: 'en', text: '' }],
    status: 'ACTIVE',
    type: 'REGULAR'
  };
}

/**
 * Gets a display name for a tariff from its display_text array
 * @param tariff The tariff object
 * @param preferredLanguage The preferred language code (ISO 639-1)
 * @returns The display name string
 */
export function getTariffDisplayName(
  tariff: OCPITariff | null, 
  preferredLanguage: string = 'en'
): string {
  if (!tariff) return 'Unknown Tariff';
  
  const displayTexts = tariff.display_text || [];
  
  // Try to find the preferred language
  const preferredText = displayTexts.find(dt => dt.language === preferredLanguage);
  if (preferredText) return preferredText.text;
  
  // Fall back to first available text
  if (displayTexts.length > 0) return displayTexts[0].text;
  
  // Final fallback to tariff_id
  return tariff.tariff_id || 'Unnamed Tariff';
}
