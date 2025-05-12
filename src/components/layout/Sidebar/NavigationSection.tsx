import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavSection } from "../navigationConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from 'react';
import { useOCPIRole } from "@/modules/ocpi/contexts/OCPIRoleContext";

interface NavigationSectionProps {
  section: NavSection;
  collapsed: boolean;
  expanded: boolean;
  toggleSection: () => void;
  mobileOpen: boolean;
  location: any; // React Router location
  userRole: string;
}

export const NavigationSection = ({
  section,
  collapsed,
  expanded,
  toggleSection,
  mobileOpen,
  location,
  userRole,
}: NavigationSectionProps) => {
  // Get OCPI-specific role for OCPI section
  const { role: ocpiRole } = useOCPIRole();
  
  // State to track which section groups are expanded
  const [expandedSectionGroups, setExpandedSectionGroups] = useState<Record<string, boolean>>({});
  
  // Function to toggle section group expansion
  const toggleSectionGroup = (sectionName: string) => {
    setExpandedSectionGroups(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  // Initialize section groups as expanded by default
  useEffect(() => {
    if (section.id === 'ocpi') {
      const sectionHeaders = section.items.filter(item => 
        item.isSection && item.role === ocpiRole
      );
      
      const initialState: Record<string, boolean> = {};
      sectionHeaders.forEach(header => {
        initialState[header.name] = true; // Start expanded
      });
      
      setExpandedSectionGroups(initialState);
    }
  }, [section.id, ocpiRole]);

  // Skip rendering if section requires admin and user is not admin
  // Special cases:
  // 1. Always show OCPI section regardless of role
  // 2. Sections with forceExpanded flag are always shown
  if (section.id !== "ocpi" && !section.forceExpanded && section.requiresAdmin && 
      userRole !== "admin" && userRole !== "ROLE_SUPERADMIN") {
    return null;
  }

  const isActiveItem = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  // Get if any items in the section are active
  const isActiveInSection = section.items.some(item => 
    isActiveItem(item.href) || 
    (item.children && item.children.some(child => isActiveItem(child.href)))
  );

  // For single item sections (like Dashboard or Logout)
  if (section.items.length === 1) {
    // Skip rendering if item requires admin and user is not admin
    if (section.items[0].requiresAdmin && userRole !== "admin" && userRole !== "ROLE_SUPERADMIN") {
      return null;
    }

    // Create component instances from ElementType
    const ItemIcon = section.items[0].icon;

    return (
      <div key={section.id} className="mb-1">
        {collapsed ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to={section.items[0].href}
                  className={({ isActive }) =>
                    cn(
                      "flex h-[42px] items-center justify-center py-2 px-3 text-sm font-medium transition-colors rounded-md",
                      isActive
                        ? "bg-primary/20 text-primary border-l-4 border-primary"
                        : "text-gray-200 hover:bg-gray-800/50 hover:text-white",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                    )
                  }
                  aria-label={section.items[0].name}
                >
                  <span className="flex items-center justify-center">
                    <ItemIcon className="h-5 w-5" />
                  </span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                {section.items[0].name}
                {section.items[0].badge && (
                  <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                    {section.items[0].badge.text}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <NavLink
            to={section.items[0].href}
            className={({ isActive }) =>
              cn(
                "flex h-[42px] items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/20 text-primary border-l-4 border-primary pl-3"
                  : "text-gray-200 hover:bg-gray-800/50 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
              )
            }
            aria-label={section.items[0].name}
          >
            <span className="flex items-center mr-3">
              <ItemIcon className="h-5 w-5" />
            </span>
            <span className="flex-1 font-inter">{section.items[0].name}</span>
            {section.items[0].badge && (
              <span 
                className={cn(
                  "ml-auto inline-flex h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                  section.items[0].badge.variant === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  section.items[0].badge.variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                  section.items[0].badge.variant === "danger" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                  section.items[0].badge.variant === "default" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                )}
              >
                {section.items[0].badge.text}
              </span>
            )}
          </NavLink>
        )}
      </div>
    );
  }

  // Create component instance from ElementType
  const SectionIcon = section.icon;

  // For multi-item sections
  return (
    <div className="mb-3">
      {/* Section header. Hidden when collapsed for regular sections */}
      {((!collapsed && !mobileOpen) || section.items.length === 1) && (
        <button
          onClick={toggleSection}
          className={cn(
            "flex w-full items-center justify-between rounded-md py-2 px-3 text-sm font-semibold transition-colors",
            location.pathname.includes(`/${section.id}/`) || isActiveInSection
              ? "bg-gray-800/50 text-white"
              : "text-gray-200 hover:bg-gray-800/50 hover:text-white",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
          )}
          aria-expanded={expanded}
          aria-controls={`section-${section.id}-items`}
        >
          <div className="flex items-center">
            <SectionIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            <span>{section.name}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-300 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
      )}
      
      {((!collapsed && (expanded || section.forceExpanded)) || mobileOpen) && (
        <div
          id={`section-${section.id}-items`}
          className={cn(
            "mt-1 space-y-1 animate-accordion-down",
          )}
        >
          {/* Special rendering for OCPI with section headers */}
          {section.id === "ocpi" && (
            <>
              {/* First render all standalone items without parent */}
              {section.items.filter(item => 
                (!item.parent && !item.isSection) && 
                (item.forceVisible || !item.role || item.role === ocpiRole)
              ).map(item => {
                // Create component instance from ElementType
                const ItemIcon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex h-[38px] items-center rounded-md py-2 pl-10 pr-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-gray-200 hover:bg-gray-800/50 hover:text-white",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                      )
                    }
                    aria-current={isActiveItem(item.href) ? "page" : undefined}
                  >
                    <span className="flex items-center mr-3">
                      <ItemIcon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 font-inter">{item.name}</span>
                    {item.badge && (
                      <span 
                        className={cn(
                          "ml-auto inline-flex h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                          item.badge.variant === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                          item.badge.variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                          item.badge.variant === "danger" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                          item.badge.variant === "default" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        )}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </NavLink>
                );
              })}
              
              {/* Then render section headers and their children */}
              {section.items.filter(item => 
                item.isSection && item.role === ocpiRole
              ).map(sectionHeader => {
                // Get all children for this section header
                const children = section.items.filter(child => 
                  child.parent === sectionHeader.name && child.role === ocpiRole
                );
                
                const SectionIcon = sectionHeader.icon;
                const isExpanded = expandedSectionGroups[sectionHeader.name];
                
                return (
                  <div key={sectionHeader.name} className="mt-3 mb-1">
                    {/* Collapsible section header */}
                    <button 
                      onClick={() => toggleSectionGroup(sectionHeader.name)}
                      className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors
                               text-gray-300 hover:text-white hover:bg-gray-800/50"
                    >
                      <div className="flex items-center">
                        <SectionIcon className="h-4 w-4 mr-2" />
                        <span className="uppercase text-xs font-semibold tracking-wide">{sectionHeader.name}</span>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Collapsible content */}
                    {isExpanded && (
                      <div className="pl-4 space-y-0.5 animate-accordion-down">
                        {children.map(child => {
                          const ItemIcon = child.icon;
                          return (
                            <NavLink
                              key={child.href}
                              to={child.href}
                              className={({ isActive }) =>
                                cn(
                                  "flex h-[36px] items-center rounded-md py-1.5 pl-4 pr-3 text-sm font-medium transition-colors",
                                  "border-l-2",
                                  isActive
                                    ? "bg-primary/10 text-primary border-primary"
                                    : "text-gray-300 hover:bg-gray-800/30 hover:text-white border-transparent",
                                  "focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-gray-900"
                                )
                              }
                              aria-current={isActiveItem(child.href) ? "page" : undefined}
                            >
                              <span className="flex items-center mr-3 ml-1">
                                <ItemIcon className="h-4 w-4" />
                              </span>
                              <span className="flex-1 font-inter text-sm">{child.name}</span>
                              {child.badge && (
                                <span 
                                  className={cn(
                                    "ml-auto inline-flex h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                                    child.badge.variant === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                                    child.badge.variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                                    child.badge.variant === "danger" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                                    child.badge.variant === "default" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  )}
                                >
                                  {child.badge.text}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
          
          {/* Standard rendering for all other sections */}
          {section.id !== "ocpi" && section.items.map((item) => {
            // Skip rendering if item requires admin and user is not admin
            // Exceptions:
            // 1. Always show items with forceVisible flag
            if (!item.forceVisible && 
                section.id !== "ocpi" && 
                item.requiresAdmin && 
                userRole !== "admin" && 
                userRole !== "ROLE_SUPERADMIN") {
              return null;
            }
            
            // Special handling for OCPI role-based items
            const isOcpiSection = section.id === "ocpi";
            
            // OCPI Role-based filtering logic
            if (isOcpiSection && item.role) {
              // If item has specific role requirement, check if it matches current OCPI role
              // This applies only to CPO and EMSP specific navigation items
              if (item.role !== ocpiRole && !item.forceVisible) {
                return null; // Skip this item if the role doesn't match
              }
              
              // Skip section headers from normal rendering - they'll be handled separately
              if (item.isSection) {
                return null;
              }
            }
            
            // Match both the old and new naming patterns to ensure backward compatibility
            const isConnectionItem = (
              item.name.includes("Connection Management") || 
              item.name.includes("Connections")
            );
            const isPartyItem = item.name.includes("Party Management") || 
                              item.name.includes("Parties");
            
            // Add specific classes for these items to ensure they can be targeted with CSS if needed
            const itemClassName = isOcpiSection && isConnectionItem ? "nav-item-connection-management" :
                                 isOcpiSection && isPartyItem ? "nav-item-party-management" : "";
            
            // Create component instance from ElementType
            const ItemIcon = item.icon;
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex h-[38px] items-center rounded-md py-2 pl-10 pr-3 text-sm font-medium transition-colors",
                    itemClassName, // Add the custom class name for Connection/Party items
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-gray-200 hover:bg-gray-800/50 hover:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                  )
                }
                aria-current={isActiveItem(item.href) ? "page" : undefined}
              >
                <span className="flex items-center mr-3">
                  <ItemIcon className="h-4 w-4" />
                </span>
                <span className="flex-1 font-inter">{item.name}</span>
                {item.badge && (
                  <span 
                    className={cn(
                      "ml-auto inline-flex h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                      item.badge.variant === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                      item.badge.variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                      item.badge.variant === "danger" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                      item.badge.variant === "default" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    )}
                  >
                    {item.badge.text}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};
