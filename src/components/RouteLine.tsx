import { useState, useEffect } from "react";
import { Polyline } from "@react-google-maps/api";
import type { Trip } from "../types/trip";

// Route line styling
const routeLineOptions = {
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 3,
  geodesic: true,
};

interface RouteLineProps {
  route: Trip["route"];
  directionsService: google.maps.DirectionsService;
  directionsRenderer: google.maps.DirectionsRenderer;
}

export const RouteLine = ({ route, directionsService, directionsRenderer }: RouteLineProps) => {
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRoutePath = async () => {
      try {
        if (!directionsService || !directionsRenderer) {
          throw new Error("Directions service or renderer not initialized");
        }

        // Create waypoints for all stops except first and last
        const waypoints = route.slice(1, -1).map((stop) => ({
          location: new google.maps.LatLng(stop.location.lat, stop.location.lon),
          stopover: true,
        }));

        const request = {
          origin: new google.maps.LatLng(route[0].location.lat, route[0].location.lon),
          destination: new google.maps.LatLng(
            route[route.length - 1].location.lat,
            route[route.length - 1].location.lon
          ),
          waypoints: waypoints,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        const result = await directionsService.route(request);

        if (!result.routes || result.routes.length === 0) {
          throw new Error("No routes returned from directions service");
        }

        // Extract the path from the result
        const path = result.routes[0].overview_path;

        setRoutePath(path);
        setError(null);

        // Update the directions renderer
        directionsRenderer.setDirections(result);
      } catch (error) {
        console.error("Detailed error in getRoutePath:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });

        setError(error instanceof Error ? error.message : "Failed to get route");

        // Fallback to straight lines if directions service fails
        const fallbackPath = route.map(
          (stop) => new google.maps.LatLng(stop.location.lat, stop.location.lon)
        );
        setRoutePath(fallbackPath);
      }
    };

    getRoutePath();
  }, [route, directionsService, directionsRenderer]);

  return (
    <>
      <Polyline path={routePath} options={routeLineOptions} />
      {error && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "10px",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            padding: "10px",
            borderRadius: "4px",
            zIndex: 1000,
            maxWidth: "80%",
            wordBreak: "break-word",
          }}
        >
          Warning: Using simplified route. Error: {error}
        </div>
      )}
    </>
  );
};
