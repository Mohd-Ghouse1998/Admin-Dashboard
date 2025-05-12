
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { NavSection } from '../navigationConfig';
import { NavigationSection } from './NavigationSection';
import { useLocation } from 'react-router-dom';

interface SideNavProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  navigationConfig: NavSection[];
  userRole: string;
}

export function SideNav({ open, setOpen, navigationConfig, userRole }: SideNavProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-gray-900 backdrop-blur-md transition-all",
        open ? "w-64" : "w-[70px]"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
            <span className="font-bold text-white">E</span>
          </div>
          {open && <span className="ml-2 font-semibold text-white">EV Admin</span>}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-1.5 hover:bg-gray-700 text-white"
        >
          <span className="material-symbols-outlined">
            {open ? "chevron_left" : "chevron_right"}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {navigationConfig.map((section) => (
          <NavigationSection
            key={section.id}
            section={section}
            collapsed={!open}
            expanded={!!expandedSections[section.id]}
            toggleSection={() => toggleSection(section.id)}
            mobileOpen={false}
            location={location}
            userRole={userRole}
          />
        ))}
      </div>
    </aside>
  );
}

export default SideNav;
