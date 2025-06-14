import { useCallback, useState, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import type { Trip } from "../../types/trip";
import { StopMarker } from "../StopMarker";
import { BusMarker } from "../BusMarker/BusMarker";
import { Header } from "../Header";
import { RouteLine } from "../RouteLine";
import { LocationButton } from "../LocationButton/LocationButton";

const containerStyle = {
  width: "100%",
  height: "100vh",
  marginTop: "0", // Will be adjusted by the header
};

// Google Maps loader options
const libraries: "geometry"[] = ["geometry"];

interface MapProps {
  trip: Trip;
  isBusLocationOutdated: boolean;
}

export const Map = ({ trip, isBusLocationOutdated }: MapProps) => {
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [isSelectedBus, setIsSelectedBus] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(
    null
  );
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      try {
        mapRef.current = map;
        // Initialize directions service and renderer
        const service = new google.maps.DirectionsService();
        const renderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true, // We'll use our own markers
        });

        setDirectionsService(service);
        setDirectionsRenderer(renderer);

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
      } catch (error) {
        console.error("Error initializing directions service:", error);
      }
    },
    [trip.route]
  );

  const onUnmount = useCallback(() => {
    // Cleanup
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  }, [directionsRenderer]);

  if (loadError) {
    console.error("Error loading Google Maps:", loadError);
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error loading Google Maps - Please try again later.
        <br />
        If the problem persists, please contact support.
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={{ padding: "20px" }}>Loading Google Maps...</div>;
  }

  // Get bus position
  const busPosition = trip.vehicle.gps
    ? {
        lat: trip.vehicle.gps.latitude,
        lng: trip.vehicle.gps.longitude,
      }
    : null;

  // Calculate delay if available
  const currentStop = trip.route.find((stop) => stop.departure.estimated);
  const delay =
    currentStop?.departure.estimated && currentStop?.departure.scheduled
      ? new Date(currentStop.departure.estimated).getTime() -
        new Date(currentStop.departure.scheduled).getTime()
      : 0;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {isBusLocationOutdated && (
        <div
          style={{
            position: "absolute",
            top: "60px", // Position below header
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "10px 20px",
            borderRadius: "4px",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          <strong>⚠️ Bus location may be outdated</strong>
          <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>
            The bus location hasn't been updated in over 5 minutes. The position shown may not be
            current.
          </p>
        </div>
      )}
      <Header title="trip map" />
      <div
        data-testid="map-container"
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
          {/* Render route line */}
          {directionsService && directionsRenderer && (
            <RouteLine
              route={trip.route}
              directionsService={directionsService}
              directionsRenderer={directionsRenderer}
            />
          )}

          {/* Render stop markers */}
          {trip.route.map((stop, index) => (
            <StopMarker
              key={stop.id}
              stop={stop}
              isSelected={selectedStopId === stop.id}
              onSelected={(id) => setSelectedStopId(id)}
              onClose={() => setSelectedStopId(null)}
              nextStop={index < trip.route.length - 1 ? trip.route[index + 1] : undefined}
              isFirstStop={index === 0}
              isLastStop={index === trip.route.length - 1}
            />
          ))}

          {/* Render bus marker */}
          {busPosition && (
            <BusMarker
              position={busPosition}
              vehicle={trip.vehicle}
              isSelected={isSelectedBus}
              onSelected={() => setIsSelectedBus(!isSelectedBus)}
              onClose={() => setIsSelectedBus(false)}
              delay={delay}
              route={trip.route}
            />
          )}

          {/* Location button and user location marker */}
          <LocationButton mapRef={mapRef} />
        </GoogleMap>
      </div>
    </div>
  );
};
