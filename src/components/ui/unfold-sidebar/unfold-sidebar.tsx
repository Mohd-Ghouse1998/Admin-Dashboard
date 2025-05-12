
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  title: string;
  icon: string;
  link: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface UnfoldSidebarProps {
  navigationSections: NavigationSection[];
  logo: string;
  appName: string;
  dashboardLink: string;
}

export const UnfoldSidebar: React.FC<UnfoldSidebarProps> = ({
  navigationSections,
  logo,
  appName,
  dashboardLink
}) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 bg-slate-800 text-white transition-all duration-300 ease-in-out z-10",
      expanded ? "w-[280px]" : "w-[70px]"
    )}>
      {/* Header with logo */}
      <div className="h-16 border-b border-slate-700 flex items-center px-4">
        <Link to={dashboardLink} className="flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-md" />
          {expanded && <span className="ml-3 font-medium text-lg">{appName}</span>}
        </Link>
        
        <button 
          className="ml-auto p-1 hover:bg-slate-700 rounded-md"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      {/* Navigation sections */}
      <div className="p-2 overflow-y-auto h-[calc(100%-4rem)]">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {expanded && <div className="text-xs uppercase text-slate-400 px-3 py-2">{section.title}</div>}
            
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <Link 
                  key={itemIdx}
                  to={item.link}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700 text-sm"
                >
                  <span className="material-icons-outlined text-lg">{item.icon}</span>
                  {expanded && <span className="ml-3">{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
