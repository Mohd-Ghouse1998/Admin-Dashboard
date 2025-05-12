
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavItem } from "./NavItem";
import type { NavItem as NavItemType } from "@/components/layout/navigationConfig";
import { usePermission } from "@/hooks/usePermission";

interface NavGroupProps {
  icon: React.ElementType;
  title: string;
  items: NavItemType[];
  isCollapsed?: boolean;
}

export const NavGroup = ({ 
  icon: Icon, 
  title, 
  items,
  isCollapsed = false
}: NavGroupProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = usePermission();
  const [visibleItems, setVisibleItems] = useState<NavItemType[]>([]);
  
  // Check permissions for admin-only items
  useEffect(() => {
    const checkPermissions = async () => {
      console.log(`Checking permissions for section: ${title}, items:`, items);
      
      try {
        // For testing/debugging: show all items initially
        setVisibleItems(items);
        
        // Only filter if permission checking works
        if (hasPermission && typeof hasPermission === 'function') {
          const filterItem = async (item: NavItemType) => {
            // If item requires admin permission, check if user has it
            if (item.requiresAdmin) {
              try {
                const response = await hasPermission('admin');
                const hasAdmin = !!response?.data;
                console.log(`Item ${item.name} requires admin, user has admin: ${hasAdmin}`);
                return hasAdmin ? item : null;
              } catch (error) {
                console.error(`Error checking admin permission for ${item.name}:`, error);
                // If permission check fails, show the item by default
                return item;
              }
            }
            return item;
          };
          
          const promises = items.map(filterItem);
          const filteredItems = await Promise.all(promises);
          
          // Filter out null items (those requiring admin permission when user doesn't have it)
          setVisibleItems(filteredItems.filter(Boolean) as NavItemType[]);
        }
      } catch (error) {
        console.error("Error in checkPermissions:", error);
        // On error, show all items
        setVisibleItems(items);
      }
    };
    
    checkPermissions();
  }, [items, hasPermission, title]);
  
  useEffect(() => {
    const isActiveGroup = items.some(item => location.pathname.startsWith(item.href));
    if (isActiveGroup && !isOpen) {
      setIsOpen(true);
    }
  }, [location.pathname, items, isOpen]);

  // Don't render if no visible items
  if (visibleItems.length === 0) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="py-1">
        {visibleItems.map((item) => {
          const ItemIcon = item.icon as React.ElementType;
          
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={ItemIcon}
              title=""
              isNested
              tooltipContent={item.name}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center w-full justify-between text-sm rounded-md transition-all",
          "text-gray-200 hover:text-white p-1.5 hover:bg-gray-800/50"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-x-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      <div 
        className={cn(
          "pl-4 mt-1 space-y-0.5 overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {visibleItems.map((item) => {
          const ItemIcon = item.icon as React.ElementType;
          
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={ItemIcon}
              title={item.name}
              isNested
            />
          );
        })}
      </div>
    </div>
  );
};
