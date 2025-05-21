import React, { useState, useEffect } from 'react';
import './scrollbar.css';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavSection } from '../navigationConfig';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOCPIRole } from "@/modules/ocpi/contexts/OCPIRoleContext";

// Animations
const sidebarVariants = {
  expanded: { width: '280px' },
  collapsed: { width: '80px' }
};

// Subtle bounce effect when opening/closing the sidebar
const bounceTransition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 0.5
};

const textVariants = {
  expanded: { opacity: 1 },
  collapsed: { opacity: 0, display: 'none' }
};

const chevronVariants = {
  expanded: { rotate: 0 },
  collapsed: { rotate: 180 }
};

const sectionVariants = {
  open: { 
    height: 'auto', 
    opacity: 1,
    transition: { 
      duration: 0.3, 
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  },
  closed: { 
    height: 0, 
    opacity: 0,
    transition: { 
      duration: 0.3, 
      when: "afterChildren" 
    }
  }
};

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -10 }
};

interface ModernSideNavProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  navigationConfig: NavSection[];
  userRole: string;
}

export function ModernSideNav({ open, setOpen, navigationConfig, userRole }: ModernSideNavProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { role: ocpiRole } = useOCPIRole();

  // Initialize section states - expand the section of the active page
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    
    navigationConfig.forEach(section => {
      // Check if any items in this section match the current path
      const isActive = section.items.some(item => 
        isActiveItem(item.href) || 
        (item.children && item.children.some(child => isActiveItem(child.href)))
      );
      
      initialState[section.id] = isActive;
    });
    
    setExpandedSections(initialState);
  }, [location.pathname]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActiveItem = (href: string) => {
    if (href === '/') return location.pathname === '/';
    
    // Special case for charging infrastructure vs charging sessions
    if (href === '/chargers') {
      // Check if the path is specifically for chargers but not for charging-sessions
      return location.pathname.startsWith('/chargers') && 
             !location.pathname.includes('/charging-sessions') &&
             !location.pathname.includes('/active-sessions') &&
             !location.pathname.includes('/sessions-history') &&
             !location.pathname.includes('/session-controls') &&
             !location.pathname.includes('/reservations') &&
             !location.pathname.includes('/statistics');
    }
    
    // For all other paths, use exact path matching or check for the specific section
    return location.pathname.startsWith(href);
  };
  
  // Filter sections based on user role
  const filteredSections = navigationConfig.filter(section => {
    if (section.id === "ocpi") return true;
    if (section.forceExpanded) return true;
    if (section.requiresAdmin && userRole !== "admin" && userRole !== "ROLE_SUPERADMIN") return false;
    return true;
  });

  return (
    <motion.aside
      className="fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 backdrop-blur-md shadow-lg overflow-hidden"
      initial={open ? "expanded" : "collapsed"}
      animate={open ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={bounceTransition}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <span className="font-bold text-white text-xl">E</span>
          </div>
          <motion.span 
            className="font-semibold text-slate-800 text-lg tracking-wide"
            variants={textVariants}
            transition={{ duration: 0.2 }}
          >
            EV Admin
          </motion.span>
        </div>
        <motion.button
          onClick={() => setOpen(!open)}
          className="rounded-md p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          variants={chevronVariants}
          transition={{ duration: 0.3 }}
        >
          <span className="material-symbols-outlined">
            chevron_left
          </span>
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto pt-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="px-3 space-y-1.5">
          {filteredSections.map((section) => {
            // Skip rendering if section should be hidden based on role
            if (section.id !== "ocpi" && !section.forceExpanded && section.requiresAdmin && 
                userRole !== "admin" && userRole !== "ROLE_SUPERADMIN") {
              return null;
            }
            
            // Get if any items in the section are active
            const isActiveInSection = section.items.some(item => 
              isActiveItem(item.href) || 
              (item.children && item.children.some(child => isActiveItem(child.href)))
            );
            
            // For single item sections (like Dashboard or Logout)
            if (section.items.length === 1) {
              const item = section.items[0];
              
              // Skip rendering if item requires admin and user is not admin
              if (item.requiresAdmin && userRole !== "admin" && userRole !== "ROLE_SUPERADMIN") {
                return null;
              }
              
              const ItemIcon = item.icon;
              
              // Render single item section
              return (
                <div key={section.id} className="mb-1">
                  {!open ? (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              cn(
                                "flex h-10 items-center justify-center rounded-lg transition-all duration-200",
                                isActive
                                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                              )
                            }
                          >
                            <div className="flex items-center justify-center px-3 py-2">
                              {ItemIcon && <ItemIcon className="h-5 w-5" />}
                            </div>
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.name}
                          {item.badge && (
                            <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                              {item.badge.text}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex h-10 items-center rounded-lg px-3 transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )
                      }
                    >
                      <div className="flex items-center">
                        {ItemIcon && <ItemIcon className="h-5 w-5 mr-3" />}
                        <motion.span 
                          className="font-medium"
                          variants={textVariants}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      </div>
                      
                      {item.badge && (
                        <motion.span 
                          variants={textVariants}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "ml-auto inline-flex h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                            item.badge.variant === "success" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                            item.badge.variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                            item.badge.variant === "danger" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                            item.badge.variant === "default" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          )}
                        >
                          {item.badge.text}
                        </motion.span>
                      )}
                    </NavLink>
                  )}
                </div>
              );
            }
            
            // For multi-item sections
            const filteredItems = section.items.filter(item => {
              // For OCPI section, filter items based on OCPI role
              if (section.id === "ocpi" && item.role && item.role !== ocpiRole) return false;
              if (item.requiresAdmin && userRole !== "admin" && userRole !== "ROLE_SUPERADMIN") return false;
              return true;
            });
            
            // Skip section if no items to show
            if (filteredItems.length === 0) return null;
            
            // Render section header and items
            return (
              <div key={section.id} className="mb-2">
                {/* Section Header (Parent Nav Item) */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg py-2 px-3 text-sm font-medium transition-colors duration-200",
                    expandedSections[section.id] ? "mb-1" : "",
                    isActiveInSection 
                      ? "text-primary bg-primary/5 dark:bg-slate-800/80 dark:text-primary-300" 
                      : "text-slate-700 dark:text-slate-200 hover:text-primary"
                  )}
                >
                  <div className="flex items-center">
                    <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                      {section.icon && <section.icon className="h-4 w-4 text-slate-600" />}
                    </span>
                    <motion.span 
                      className="font-medium"
                      variants={textVariants}
                      transition={{ duration: 0.2 }}
                    >
                      {section.name}
                    </motion.span>
                  </div>
                  {open && (
                    <motion.div
                      animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  )}
                </button>
                
                {/* Section Items */}
                {open && (
                  <motion.div
                    className="overflow-hidden pl-4"
                    initial="closed"
                    animate={expandedSections[section.id] ? "open" : "closed"}
                    variants={sectionVariants}
                  >
                    {filteredItems.map((item, index) => {
                      const itemActive = location.pathname === item.href;
                      return (
                        <motion.div key={`${section.id}-${index}`} variants={itemVariants}>
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              cn(
                                "flex h-8 items-center rounded-lg px-6 py-1.5 text-sm font-normal transition-colors my-0.5 ml-2",
                                itemActive
                                  ? "bg-blue-50 text-blue-700 shadow-sm font-semibold dark:bg-slate-800/80 dark:text-primary-200"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                              )
                            }
                          >
                            <div className="flex items-center">
                              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                              <span>{item.name}</span>
                            </div>
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
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className={cn(
          "flex items-center rounded-lg p-2 transition-colors", 
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-blue-700" />
          </div>
          <motion.div 
            className="ml-3" 
            variants={textVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="text-sm font-medium text-slate-800">Admin User</div>
            <div className="text-xs text-slate-500">admin@example.com</div>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}

// User icon component
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default ModernSideNav;
