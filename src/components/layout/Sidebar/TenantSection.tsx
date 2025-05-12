
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TenantSectionProps {
  tenant: any; // Replace with proper tenant type
  collapsed: boolean;
}

export const TenantSection = ({ tenant, collapsed }: TenantSectionProps) => {
  const tenantName = tenant?.name || 'EV Charging';
  const tenantInitial = tenantName.charAt(0).toUpperCase();

  return (
    <div className={cn(
      "flex h-16 items-center border-b border-sidebar-border px-4 py-4",
      collapsed && "justify-center px-2",
      "dark:border-[#334155] border-[#E2E8F0]"
    )}>
      {!collapsed ? (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold">
            {tenantInitial}
          </div>
          <span className="text-base font-semibold text-sidebar-foreground truncate max-w-[180px] font-inter">
            {tenantName}
          </span>
        </div>
      ) : (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-8 w-8 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold">
                {tenantInitial}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {tenantName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
