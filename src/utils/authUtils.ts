
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Checks if the user has a valid authentication token
 * @returns boolean indicating if user has a valid token
 */
export const useValidToken = () => {
  const { accessToken } = useAuth();
  const [hasValidToken, setHasValidToken] = useState<boolean>(false);

  useEffect(() => {
    setHasValidToken(!!accessToken);
  }, [accessToken]);

  return { hasValidToken, accessToken };
};

/**
 * Helper function to check if a token exists and is non-empty
 * @param token The token to validate
 * @returns boolean indicating if token is valid
 */
export const isValidToken = (token?: string | null): boolean => {
  return !!token && token.length > 0;
};
