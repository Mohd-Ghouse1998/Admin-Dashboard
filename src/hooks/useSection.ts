
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function useSection() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  useEffect(() => {
    // Extract the first path segment as the active section
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      // We're at the root, so the active section is dashboard
      setActiveSection('dashboard');
      setActiveSubSection(null);
      return;
    }
    
    // Map specific paths to their corresponding sections
    const sectionMap: Record<string, string> = {
      'chargers': 'charger-module',
      'charger-configs': 'charger-module',
      'charging-sessions': 'charger-module',
      'id-tags': 'charger-module',
      'meter-values': 'charger-module',
      'ocpp-commands': 'charger-module',
      
      'users': 'user-module',
      'groups': 'user-module',
      'permissions': 'user-module',
      'profiles': 'user-module',
      
      'wallets': 'payment-module',
      'transactions': 'payment-module',
      'plans': 'payment-module',
      'subscriptions': 'payment-module',
      'orders': 'payment-module',
      'tax-settings': 'payment-module',
      'payment-gateways': 'payment-module',

      'ocpi': 'integration-module',
      
      'tenants': 'tenant-module',
      'domains': 'tenant-module',
      'apps': 'tenant-module',
      
      'settings': 'settings-module',

      'logout': 'logout-module'
    };
    
    const firstSegment = pathSegments[0];
    setActiveSection(sectionMap[firstSegment] || firstSegment);
    
    // If there's more than one segment, the second one is the sub-section
    if (pathSegments.length > 1) {
      setActiveSubSection(pathSegments[1]);
    } else {
      setActiveSubSection(null);
    }
  }, [location.pathname]);

  return { activeSection, activeSubSection };
}
