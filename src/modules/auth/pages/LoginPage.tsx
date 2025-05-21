
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { extractErrorMessage } from '@/utils/errorUtils';
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
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
    
    // Validate inputs before submitting
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    
    try {
      await login(username, password);
      
      // Success toast
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success"
      });
      
      // Always redirect to root (dashboard) after successful login
      navigate('/', { replace: true });
    } catch (err: any) {
      // Extract error message using utility function
      const errorMessage = extractErrorMessage(err, "Login failed");
      setError(errorMessage);
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // If the tenant information changes, update the UI
  useEffect(() => {
    if (tenant) {
      // Apply tenant branding
      document.documentElement.style.setProperty('--primary-color', tenant.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', tenant.secondaryColor);
    }
  }, [tenant]);
  
  // Show loading state while validating domain
  if (isTenantLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="h-16 w-16 rounded-md bg-primary-600 mb-6 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <p>Validating domain...</p>
        </div>
      </div>
    );
  }
  
  // Show error if domain validation failed
  if (tenantError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-md bg-primary-600 mb-6"></div>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof tenantError === 'string' ? tenantError : "Domain validation failed. Please check the URL or contact support."}
          </AlertDescription>
        </Alert>
        <p className="text-center text-sm text-muted-foreground">
          For assistance, please contact <a href="mailto:support@evcharging.com" className="text-primary-600 hover:underline">support@evcharging.com</a>
        </p>
      </div>
    );
  }
  
  // Main login form
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          {tenant.logo ? (
            <img 
              src={tenant.logo} 
              alt={`${tenant.name} Logo`} 
              className="h-16 w-auto"
            />
          ) : (
            <div 
              className="h-12 w-12 rounded-md" 
              style={{ backgroundColor: tenant.primaryColor }}
            ></div>
          )}
        </div>
        <CardTitle className="text-2xl text-center">{tenant.name}</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the admin portal
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Show error message if any */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isAuthLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm hover:underline"
                style={{ color: tenant.primaryColor }}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isAuthLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => 
                setRememberMe(checked === true)
              }
              disabled={isAuthLoading}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            type="submit" 
            className="w-full hover:opacity-90"
            style={{ 
              backgroundColor: tenant.primaryColor,
              color: 'white'
            }}
            disabled={isAuthLoading}
          >
            {isAuthLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="hover:underline"
              style={{ color: tenant.primaryColor }}
            >
              Request access
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginPage;
