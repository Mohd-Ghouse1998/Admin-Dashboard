import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from '@/utils/errorUtils';
import { useAuth } from "@/contexts/AuthContext";

const ModernLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tenant, isLoading: isTenantLoading, error: tenantError } = useTenant();
  const { login, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    
    try {
      await login(username, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success"
      });
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage || "Failed to login. Please check your credentials and try again.");
      toast({
        title: "Login failed",
        description: errorMessage || "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  };

  if (isTenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mb-4 p-3 border border-red-200 rounded bg-red-50 text-red-700 text-sm">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p>{extractErrorMessage(tenantError) || "Failed to load tenant information"}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-blue-100 to-blue-400 dark:from-blue-600 dark:to-blue-500 rounded-lg shadow-lg p-8 w-full sm:w-[400px] md:w-[450px]">
        {/* ChargerZone text as logo placeholder */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-blue-700 dark:text-white">
            ChargerZone
          </h1>
        </div>
        
        <h2 className="text-3xl font-semibold text-center text-blue-700 dark:text-white mb-6">
          {tenant?.name || "EV Charging Admin"}
        </h2>
        
        {error && (
          <div className="mb-6 p-3 border border-red-200 rounded-lg bg-red-50/90 text-red-700 dark:bg-red-900/40 dark:border-red-800/60 dark:text-red-300">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <Label htmlFor="username" className="block text-sm font-medium text-blue-700 dark:text-white mb-1.5">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="mt-1 block w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 ease-in-out"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="block text-sm font-medium text-blue-700 dark:text-white">
                Password
              </Label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-200 dark:hover:text-blue-100 underline transition-all duration-200 ease-in-out"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 ease-in-out"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          
          <div className="flex items-center mb-6">
            <label className="flex items-center text-sm text-blue-700 dark:text-white cursor-pointer">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2">Remember me</span>
            </label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-3 px-4 text-white font-semibold bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg" 
            disabled={isAuthLoading}
          >
            {isAuthLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ModernLoginPage;
