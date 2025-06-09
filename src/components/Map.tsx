import { useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import type { Trip } from "../types/trip";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

interface MapProps {
  trip: Trip;
}

export const Map = ({ trip }: MapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    // We'll use this later for custom controls and interactions
    console.log("Map loaded:", map);
  }, []);

  const onUnmount = useCallback(() => {
    // Cleanup if needed
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  // Use the first stop's location as the center of the map
  const center = {
    lat: trip.route[0].location.lat,
    lng: trip.route[0].location.lon,
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
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
      }}
    >
      {/* Render stop markers */}
      {trip.route.map((stop) => (
        <Marker
          key={stop.id}
          position={{
            lat: stop.location.lat,
            lng: stop.location.lon,
          }}
          title={stop.location.name}
        />
      ))}

      {/* Render bus marker */}
      <Marker
        position={{
          lat: trip.vehicle.gps.latitude,
          lng: trip.vehicle.gps.longitude,
        }}
        title={`Bus ${trip.vehicle.plate_number}`}
      />
    </GoogleMap>
  );
};
