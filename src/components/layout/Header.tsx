/**
 * @deprecated This component is deprecated. Please import ModernHeader directly.
 * This file exists only for backward compatibility and will be removed in a future update.
 */

import { useState, useEffect } from "react";
import { Bell, User, ChevronDown, Search, Settings, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  toggleSidebar?: () => void;
  isMobile?: boolean;
}

const Header = ({ toggleSidebar, isMobile = false }: HeaderProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username?.substring(0, 2)?.toUpperCase() || "U";
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 transition-all duration-200",
        scrolled && "shadow-sm"
      )}
    >
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Mobile menu button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="lg:hidden mr-2" 
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        )}

        {/* Search button (visible only on mobile) */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
        )}
        
        {/* Search */}
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
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input 
                type="search"
                placeholder="Search stations, sessions, users..."
                className={cn(
                  "w-full bg-white pl-9 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500/30 focus-visible:ring-offset-0 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors",
                  showSearch && "pl-10",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className={cn(
          "flex items-center gap-1 md:gap-2 ml-auto",
          showSearch ? "hidden md:flex" : "flex"
        )}>
          {/* Dark/Light Mode Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-rose-500 border-2 border-white dark:border-gray-900">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h5 className="font-medium text-gray-900 dark:text-white">Notifications</h5>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2">
                  Mark all as read
                </Button>
              </div>
              
              <div className="py-2 max-h-[380px] overflow-y-auto">
                <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-3">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                        New session started
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        A new charging session has started on Station #23
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-3">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                        Maintenance alert
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        Station #05 needs maintenance - Error code E-123
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        35 minutes ago
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-3">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">
                        Payment received
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        ₹1,250 payment received from user John Doe
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        Yesterday at 4:30 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" className="w-full text-sm h-9" size="sm">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 ml-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full pr-3 pl-1.5 h-10"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  {getInitials()}
                </div>
                <div className="hidden md:block text-left text-sm">
                  <p className="font-medium truncate max-w-[120px]">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">{user?.role || "User"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden md:block ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              <div className="flex items-center gap-3 px-2 py-1.5 mb-1 md:hidden">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "User"}</p>
                </div>
              </div>
              
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-2.5 cursor-pointer text-gray-700 dark:text-gray-200 focus:text-gray-900 dark:focus:text-white rounded-md">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 py-2.5 px-2.5 cursor-pointer text-gray-700 dark:text-gray-200 focus:text-gray-900 dark:focus:text-white rounded-md">
                <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-1.5 bg-gray-100 dark:bg-gray-800" />
              
              <DropdownMenuItem 
                onClick={logout}
                className="flex items-center gap-2 py-2.5 px-2.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-md"
              >
                <LogOut className="h-4 w-4" />
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
