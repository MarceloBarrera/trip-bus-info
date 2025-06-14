import "./App.css";
import { Map } from "./components/Map/Map";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { OfflineMessage } from "./components/OfflineMessage/OfflineMessage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount) => {
        // Only retry if we're online
        if (!navigator.onLine) return false;
        // Retry up to 2 times
        return failureCount < 2;
      },
      networkMode: "offlineFirst", // Try to use cached data when offline
    },
  },
});

// Custom hook to fetch trip data
function useTripData(tripId: string) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const response = await fetch(`https://api.ember.to/v1/trips/${tripId}`);
      if (!response.ok) {
        let errorMessage = "Error loading trip data";

        switch (response.status) {
          case 403:
            errorMessage = "Access denied. You don't have permission to view this trip.";
            break;
          case 404:
            errorMessage = "Trip not found. Please check the trip ID.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = "Error loading trip data. Please try again.";
        }

        throw new Error(errorMessage);
      }
      return response.json();
    },
  });
}

function TripMap() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("id") || "GrnisKd8ABak8d5Lxigqsh"; // fallback to default ID
  const { data: trip, isLoading, isError, error } = useTripData(tripId);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isBusLocationOutdated = trip?.vehicle?.gps?.last_updated
    ? (new Date().getTime() - new Date(trip.vehicle.gps.last_updated).getTime()) / (1000 * 60) > 5
    : false;

  if (isLoading) return <div>Loading trip data...</div>;
  if (isError)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Error</h2>
        <p>{error instanceof Error ? error.message : "Error loading trip data"}</p>
        <p>
          Go to <a href="https://www.ember.to/">home page</a>
        </p>
      </div>
    );
  if (!trip && !isOffline)
    return (
      <div>
        No trip data found - go to the <a href="/">home page</a>
      </div>
    );

  // If we're offline and have no cached data
  if (isOffline && !trip) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>You are offline</h2>
        <p>Please check your internet connection and try again.</p>
        <p>Last known trip data is not available.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {isOffline && <OfflineMessage />}
      <Map trip={trip} isBusLocationOutdated={isBusLocationOutdated} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TripMap />
    </QueryClientProvider>
  );
}

export default App;
