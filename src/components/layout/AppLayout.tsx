
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SideNav } from "@/components/layout/Sidebar/SideNav";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { navigationConfig } from "./navigationConfig";

const AppLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebar-open");
    return savedState ? savedState === "true" : !isMobile;
  });

  const [mobileOverlayVisible, setMobileOverlayVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setMobileOverlayVisible(false);
      } else {
        const savedState = localStorage.getItem("sidebar-open");
        setSidebarOpen(savedState ? savedState === "true" : true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (isMobile) {
      setMobileOverlayVisible(newState);
    }
    localStorage.setItem("sidebar-open", String(newState));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Mobile overlay */}
        {mobileOverlayVisible && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
              setMobileOverlayVisible(false);
            }}
          />
        )}

        {/* Sidebar */}
        <SideNav 
          open={sidebarOpen}
          navigationConfig={navigationConfig}
          userRole={user?.role || "user"}
          setOpen={(open) => {
            setSidebarOpen(open);
            setMobileOverlayVisible(open && isMobile);
            localStorage.setItem("sidebar-open", String(open));
          }} 
        />

        {/* Main content area with proper margin for sidebar */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-[70px]"
        )}>
          {/* Header */}
          <Header />

          {/* Mobile header */}
          <div className="lg:hidden flex items-center h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-4"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;
