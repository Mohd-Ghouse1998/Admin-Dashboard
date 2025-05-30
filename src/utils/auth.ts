/**
 * Authentication utilities for handling tokens in the multi-tenant system
 */

// Get the auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set the auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove the auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Parse JWT token to get payload (without validation)
export const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Get user info from token
export const getUserFromToken = (): any => {
  const token = getAuthToken();
  if (!token) return null;
  
  return parseJwt(token);
};

// Check if token is expired
export const isTokenExpired = (): boolean => {
  const user = getUserFromToken();
  if (!user) return true;
  
  // Check if token expiration time (exp) is past current time
  return user.exp * 1000 < Date.now();
};
