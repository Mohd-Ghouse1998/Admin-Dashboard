/**
 * Simplified navigation hook that ensures OCPI items are always visible
 * This replaces the complex navigation integration with a simple, reliable approach
 */
import { useCallback } from 'react';

export function useNavigationReplacer() {
  /**
   * This is a simplified version of the navigation replacer
   * The actual DOM manipulation is now handled directly in the OCPILayout component
   * This hook is kept for backward compatibility with existing components
   */
  const updateNavigation = useCallback(() => {
    // No complex logic needed - kept for backward compatibility
    console.debug('OCPI navigation update: Using simplified navigation approach');
    
    // The actual navigation updating is now done via:
    // 1. The forceVisible flags in navigationConfig.tsx
    // 2. The CSS in ocpiNavigation.css
    // 3. The DOM manipulation in OCPILayout.tsx useEffect
    
    return true;
  }, []);

  return { updateNavigation };
}
