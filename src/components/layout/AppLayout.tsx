/**
 * Main application layout component with modern sidebar navigation.
 */

import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModernSideNav } from "@/components/layout/Sidebar/ModernSideNav";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { navigationConfig } from "./navigationConfig";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { OCPIRoleProvider } from "@/modules/ocpi/contexts/OCPIRoleContext";

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
      <ThemeProvider defaultTheme="light" storageKey="ev-admin-theme">
        <OCPIRoleProvider>
          <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Mobile overlay */}
            {mobileOverlayVisible && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
                onClick={() => {
                  setSidebarOpen(false);
                  setMobileOverlayVisible(false);
                }}
              />
            )}

            {/* Modern Sidebar */}
            <ModernSideNav 
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
              "flex-1 flex flex-col min-w-0 transition-all duration-300",
              sidebarOpen ? "lg:ml-[280px]" : "lg:ml-[80px]"
            )}>
              {/* Header */}
              <Header 
                toggleSidebar={toggleSidebar}
                isMobile={true}
              />

              {/* Main content */}
              <main className="flex-1 overflow-y-auto">
                <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </OCPIRoleProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
};

export default AppLayout;
