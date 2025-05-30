import React, { createContext, useContext, ReactNode } from 'react';
import { useJsApiLoader, LoadScriptProps } from '@react-google-maps/api';

// Define the API key and libraries
// For development, this will show a watermark but maps will still load
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const googleMapsLibraries: LoadScriptProps['libraries'] = ['places'];

// Define the shape of our context
interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

// Create the context with default values
const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

// Define the provider props
interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Create the provider component
export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  // Load the Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries,
  });

  // Provide the values to children components
  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// Create a hook to use the context
export const useGoogleMaps = () => useContext(GoogleMapsContext);
