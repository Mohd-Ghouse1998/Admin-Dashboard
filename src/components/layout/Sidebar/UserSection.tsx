
import { Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserSectionProps {
  collapsed: boolean;
}

export const UserSection = ({ collapsed }: UserSectionProps) => {
  const { user } = useAuth();
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Admin User';
  const userEmail = user?.email || 'admin@example.com';

  if (collapsed) {
    return (
      <div className="border-t border-sidebar-border p-2 flex justify-center">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-8 w-8 rounded-full bg-sidebar-accent/70 flex items-center justify-center cursor-pointer">
                <UserCircle className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-xs opacity-70">{userEmail}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent/70 flex items-center justify-center">
            <UserCircle className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground font-inter">
              {userName}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {userEmail}
            </span>
          </div>
        </div>
        <button 
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar rounded-full p-1"
          aria-label="User settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
