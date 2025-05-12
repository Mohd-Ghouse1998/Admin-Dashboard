import React, { useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { OCPIHeaderActions } from './OCPIHeaderActions';
import { Outlet } from 'react-router-dom';
import { useOCPIRole } from '../contexts/OCPIRoleContext';

// Import the CSS that ensures navigation items are always visible
import '../styles/ocpiNavigation.css';

interface OCPILayoutProps {
  title?: string;
  description?: string;
}

/**
 * Specialized layout for OCPI pages that includes the role switcher in the header
 */
export const OCPILayout: React.FC<OCPILayoutProps> = ({ 
  title = "OCPI Module",
  description = "Open Charge Point Interface Management"
}) => {
  const { role } = useOCPIRole();
  
  // Direct JavaScript fix to ensure navigation items always appear
  useEffect(() => {
    // Simple but effective function to ensure critical navigation items are visible
    const ensureOCPINavigation = () => {
      try {
        // 1. Find the OCPI section
        const ocpiSection = document.querySelector('[data-section-id="ocpi"]');
        if (!ocpiSection) {
          console.debug('OCPI section not found in the DOM yet');
          return;
        }

        // 2. We don't auto-expand the section anymore to allow it to be collapsed
        // But we'll check if it's expanded to help with debugging
        const sectionButton = ocpiSection.querySelector('button');
        const isSectionExpanded = sectionButton && sectionButton.getAttribute('aria-expanded') === 'true';
        console.debug(`OCPI section is ${isSectionExpanded ? 'expanded' : 'collapsed'}`);
        
        // Important: Only proceed with ensuring items if the section is expanded
        // This allows the section to be collapsed normally
        if (!isSectionExpanded) {
          return;
        }

        // 3. Find the items container
        let itemsContainer = document.getElementById('section-ocpi-items');

        // Also try alternative selector if the ID approach doesn't work
        if (!itemsContainer) {
          itemsContainer = ocpiSection.querySelector('div[class*="space-y"]') as HTMLElement;
        }

        if (!itemsContainer) {
          console.debug('OCPI items container not found');
          return;
        }

        // 4. Make sure the container is visible
        (itemsContainer as HTMLElement).style.display = 'block';
        (itemsContainer as HTMLElement).style.visibility = 'visible';
        (itemsContainer as HTMLElement).style.opacity = '1';

        // 5. Check if our critical navigation links exist
        const connectionItem = itemsContainer.querySelector('a[href^="/ocpi/connections"]');
        const partyItem = itemsContainer.querySelector('a[href^="/ocpi/cpo/parties"]');

        // 6. If either item is missing, create it
        if (!connectionItem || !partyItem) {
          // Find a template to clone (any navigation item)
          const existingItem = itemsContainer.querySelector('a') as HTMLAnchorElement;

          // If no existing items, we need to create from scratch
          const template = existingItem 
            ? existingItem.cloneNode(true) as HTMLAnchorElement 
            : document.createElement('a') as HTMLAnchorElement;

          // Extract CSS class from an existing item or use a default
          const cssClass = existingItem 
            ? existingItem.className 
            : 'flex items-center rounded-md px-3 py-2 text-sm font-medium';

          // Create Connection Management if missing
          if (!connectionItem) {
            const newConnectionItem = template.cloneNode(true) as HTMLAnchorElement;
            newConnectionItem.href = '/ocpi/connections';
            newConnectionItem.textContent = 'Connection Management';
            newConnectionItem.className = cssClass + ' ocpi-connection-item';
            
            // Add to the beginning of the container
            if (itemsContainer.firstChild) {
              itemsContainer.insertBefore(newConnectionItem, itemsContainer.firstChild);
            } else {
              itemsContainer.appendChild(newConnectionItem);
            }
            console.debug('Added Connection Management navigation item');
          }

          // Create Party Management if missing
          if (!partyItem) {
            const newPartyItem = template.cloneNode(true) as HTMLAnchorElement;
            newPartyItem.href = '/ocpi/cpo/parties';
            newPartyItem.textContent = 'Party Management';
            newPartyItem.className = cssClass + ' ocpi-party-item';
            
            // Add after the Connection Management item
            const insertAfter = itemsContainer.querySelector('.ocpi-connection-item') || itemsContainer.firstChild;
            
            if (insertAfter && insertAfter.nextSibling) {
              itemsContainer.insertBefore(newPartyItem, insertAfter.nextSibling);
            } else if (insertAfter) {
              itemsContainer.appendChild(newPartyItem);
            } else {
              itemsContainer.appendChild(newPartyItem);
            }
            console.debug('Added Party Management navigation item');
          }
        }
      } catch (error) {
        console.error('Error ensuring OCPI navigation:', error);
      }
    };

    // Run immediately on mount
    ensureOCPINavigation();
    
    // Run again after a brief delay to ensure DOM is fully loaded
    const initialTimeoutId = setTimeout(ensureOCPINavigation, 500);

    // Also run whenever the page changes
    window.addEventListener('popstate', ensureOCPINavigation);
    
    // Run periodically to make sure the navigation items stay visible
    const intervalId = setInterval(ensureOCPINavigation, 2000);

    // Clean up
    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
      window.removeEventListener('popstate', ensureOCPINavigation);
    };
  }, []);
  

  return (
    <PageLayout 
      title={title} 
      description={description}
      actions={<OCPIHeaderActions />}
    >
      <div className="mb-4 py-2 px-3 bg-slate-50 border rounded-lg inline-block">
        <span className="text-sm font-medium mr-2">Active OCPI Role:</span>
        <span className="text-sm font-bold text-blue-600">{role}</span>
      </div>
      <Outlet />
    </PageLayout>
  );
};
