import "./App.css";
import { Map } from "./components/Map";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

// Create a client
const queryClient = new QueryClient();

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

function TripMap() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("id") || "GrnisKd8ABak8d5Lxigqsh"; // fallback to default ID
  const { data: trip, isLoading, error } = useTripData(tripId);

  const isBusLocationOutdated = trip?.vehicle?.gps?.last_updated
    ? (new Date().getTime() - new Date(trip.vehicle.gps.last_updated).getTime()) / (1000 * 60) > 5
    : false;

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error loading trip data - please try again later or go to the <a href="/">home page</a>
      </div>
    );
  if (!trip)
    return (
      <div>
        No trip data found - go to the <a href="/">home page</a>
      </div>
    );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
