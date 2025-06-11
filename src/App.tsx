import "./App.css";
import { Map } from "./components/Map/Map";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount) => {
        // Only retry if we're online
        if (!navigator.onLine) return false;
        // Retry up to 3 times
        return failureCount < 3;
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
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });
}

function OfflineMessage() {
  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "10px 20px",
        borderRadius: "4px",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "80%",
      }}
    >
      <strong>⚠️ You are offline</strong>
      <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>
        Some features may be limited. The map will show the last known position of the bus.
      </p>
    </div>
  );
}

function TripMap() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("id") || "GrnisKd8ABak8d5Lxigqsh"; // fallback to default ID
  const { data: trip, isLoading, isError } = useTripData(tripId);
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

  if (isLoading) return <div>Loading...</div>;
  if (isError && !isOffline)
    return (
      <div>
        Error loading trip data - please try again later or go to the <a href="/">home page</a>
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
