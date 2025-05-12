import { useState } from "react";
import { Bell, User, ChevronDown, Search, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const { logout, user } = useAuth();

  const getInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username?.substring(0, 2)?.toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          showSearch ? "md:flex-1" : "hidden md:block md:w-72"
        )}>
          <div className="relative">
            {showSearch && (
              <button 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 md:hidden" 
                onClick={() => setShowSearch(false)}
              >
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            )}
            <Search className="absolute left-3 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search..." 
              className={cn(
                "pl-10 md:pl-10 bg-gray-50 border-gray-200",
                showSearch && "pl-10"
              )}
            />
          </div>
        </div>
        
        <div className={cn(
          "flex items-center ml-auto",
          showSearch ? "hidden md:flex" : "flex"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          
          <Button variant="ghost" size="icon" className="mr-2 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#4284C0] flex items-center justify-center text-white text-sm font-medium">
                  {getInitials()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "User"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
