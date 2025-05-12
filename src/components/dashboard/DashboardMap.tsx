
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from 'lucide-react';

interface DashboardMapProps {
  isLoading?: boolean;
}

export const DashboardMap = ({ isLoading = false }: DashboardMapProps) => {
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Simulate map loading
  useEffect(() => {
    if (!isLoading && !mapInitialized) {
      const timer = setTimeout(() => {
        setMapInitialized(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, mapInitialized]);
  
  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }
  
  // This is a placeholder map component
  // In a real implementation, you would integrate with a mapping library like Mapbox or Google Maps
  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {!mapInitialized ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-md shadow-md p-2">
            <div className="flex space-x-2">
              <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-xs">Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-xs">In Use</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="text-xs">Offline</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-xs">Fault</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-md shadow-md p-1">
            <div className="flex flex-col space-y-1">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="10" height="8" x="2" y="2" rx="2"/><rect width="10" height="8" x="12" y="2" rx="2"/><rect width="10" height="8" x="12" y="14" rx="2"/><rect width="10" height="8" x="2" y="14" rx="2"/></svg>
              </button>
            </div>
          </div>
          
          <div className="h-full w-full bg-[url('/maps-background.jpg')] bg-cover bg-center opacity-70 dark:opacity-50"></div>
          
          {/* Sample Map Markers */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <MapMarker color="green" />
          </div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapMarker color="blue" />
          </div>
          <div className="absolute top-2/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
            <MapMarker color="gray" />
          </div>
          <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
            <MapMarker color="red" />
          </div>
          <div className="absolute top-3/4 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
            <MapMarker color="green" />
          </div>
        </>
      )}
    </div>
  );
};

// Map marker component
const MapMarker = ({ color }: { color: 'green' | 'blue' | 'gray' | 'red' }) => {
  const colorClasses = {
    green: "text-green-600",
    blue: "text-blue-600",
    gray: "text-gray-500",
    red: "text-red-600"
  };
  
  return (
    <div className={`${colorClasses[color]} drop-shadow-lg hover:scale-125 transition-transform cursor-pointer`}>
      <MapPin size={24} fill="currentColor" />
    </div>
  );
};
