import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import type { Trip } from "../types/trip";
import { StopMarker } from "./StopMarker";
import { BusMarker } from "./BusMarker";
import { Header } from "./Header";

const containerStyle = {
  width: "100%",
  height: "100vh",
  marginTop: "0", // Will be adjusted by the header
};

interface MapProps {
  trip: Trip;
}

export const Map = ({ trip }: MapProps) => {
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);
  const [hoveredBus, setHoveredBus] = useState(false);

  console.log("Map rendering with trip:", trip);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Log any loading errors
  if (loadError) {
    console.error("Error loading Google Maps:", loadError);
  }

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      console.log("Map loaded successfully", map);

      // Fit bounds to include all stops
      const bounds = new google.maps.LatLngBounds();
      trip.route.forEach((stop) => {
        bounds.extend({
          lat: stop.location.lat,
          lng: stop.location.lon,
        });
      });

      // Add padding to bounds
      map.fitBounds(bounds, 50);
    },
    [trip.route]
  );

  const onUnmount = useCallback(() => {
    // Cleanup if needed
  }, []);

  if (!isLoaded) {
    console.log("Map is still loading...");
    return <div>Loading...</div>;
  }

  // Get bus position
  const busPosition = trip.vehicle.gps
    ? {
        lat: trip.vehicle.gps.latitude,
        lng: trip.vehicle.gps.longitude,
      }
    : null;

  console.log("Bus position:", busPosition);
  console.log("Number of stops:", trip.route.length);

  // Calculate delay if available
  const currentStop = trip.route.find((stop) => stop.departure.estimated);
  const delay =
    currentStop?.departure.estimated && currentStop?.departure.scheduled
      ? new Date(currentStop.departure.estimated).getTime() -
        new Date(currentStop.departure.scheduled).getTime()
      : 0;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Header title="trip map" />
      <div
        style={{
          height: "calc(100% - 48px)", // Subtract header height and extra space for controls
          width: "100%",
          marginTop: "48px", // Space for header
        }}
      >
        <GoogleMap
          mapContainerStyle={{
            ...containerStyle,
            height: "100%", // Use full height of parent
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
            gestureHandling: "greedy",

            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            },
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: false,
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM,
            },
          }}
        >
          {/* Render stop markers */}
          {trip.route.map((stop, index) => (
            <StopMarker
              key={stop.id}
              stop={stop}
              isHovered={hoveredStop === index}
              onMouseOver={() => setHoveredStop(index)}
              onMouseOut={() => setHoveredStop(null)}
            />
          ))}

          {/* Render bus marker */}
          {busPosition && (
            <BusMarker
              position={busPosition}
              vehicle={trip.vehicle}
              isHovered={hoveredBus}
              onMouseOver={() => setHoveredBus(true)}
              onMouseOut={() => setHoveredBus(false)}
              delay={delay}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};
