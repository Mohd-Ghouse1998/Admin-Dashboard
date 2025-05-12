
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { tenant, isLoading: isTenantLoading, error: tenantError } = useTenant();
  const { forgotPassword, isLoading: isAuthLoading, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
    }
  };

  // If the tenant information is loading
  if (isTenantLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="h-16 w-16 rounded-md bg-primary-500 mb-6 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
          <p>Validating domain...</p>
        </div>
      </div>
    );
  }

  // Show error if domain validation failed
  if (tenantError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-md bg-primary-500 mb-6"></div>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {tenantError || "Domain validation failed. Please check the URL or contact support."}
          </AlertDescription>
        </Alert>
        <p className="text-center text-sm text-muted-foreground">
          For assistance, please contact <a href="mailto:support@evcharging.com" className="text-primary-500 hover:underline">support@evcharging.com</a>
        </p>
      </div>
    );
  }

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
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          {submitted 
            ? "Check your email for reset instructions" 
            : "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      
      {submitted ? (
        <CardContent className="space-y-4">
          <div className="text-center p-4">
            <AlertCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              If an account exists with that email, we've sent password reset instructions.
            </p>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Show auth error if any */}
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isAuthLoading}
              />
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
                  Processing...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm hover:underline"
                style={{ color: tenant.primaryColor }}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default ForgotPassword;
