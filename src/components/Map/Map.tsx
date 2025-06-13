import { useCallback, useState, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import type { Trip } from "../../types/trip";
import { StopMarker } from "../StopMarker";
import { BusMarker } from "../BusMarker/BusMarker";
import { Header } from "../Header";
import { RouteLine } from "../RouteLine";

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
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);
  const [hoveredBus, setHoveredBus] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
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

  const handleShowMyLocation = useCallback(() => {
    console.log("handleShowMyLocation");
    if (!navigator.geolocation) {
      setUserLocationError("Geolocation is not supported by your browser");
      return;
    }

    setUserLocationError(null);

    // Add timeout to handle cases where the browser doesn't respond
    const timeoutId = setTimeout(() => {
      setUserLocationError("Location request timed out. Please try again.");
    }, 10000); // 10 second timeout

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId); // Clear timeout on success
        console.log("position", position);
        const { latitude, longitude } = position.coords;
        const location = new google.maps.LatLng(latitude, longitude);
        setUserLocation(location);

        // Center map on user location
        if (mapRef.current) {
          mapRef.current.panTo(location);
          mapRef.current.setZoom(15); // Zoom in to show more detail
        }
      },
      (error) => {
        clearTimeout(timeoutId); // Clear timeout on error
        let errorMessage = "Unable to retrieve your location";

        // Handle specific error cases
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access was denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting your location.";
        }

        setUserLocationError(errorMessage);
        console.error("Error getting location:", error);
      },
      options
    );
  }, []);

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
              isHovered={hoveredStop === index}
              onMouseOver={() => setHoveredStop(index)}
              onMouseOut={() => setHoveredStop(null)}
              nextStop={index < trip.route.length - 1 ? trip.route[index + 1] : undefined}
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
              route={trip.route}
            />
          )}

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#34A853",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}

          {/* Location button */}
          <div
            style={{
              position: "absolute",
              bottom: "160px",
              right: "10px",
              zIndex: 1000,
            }}
          >
            <button
              type="button"
              onClick={handleShowMyLocation}
              style={{
                backgroundColor: "#34A853",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              title="Show My Location"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Error message for location */}
          {userLocationError && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "10px 20px",
                borderRadius: "4px",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {userLocationError}
            </div>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};
