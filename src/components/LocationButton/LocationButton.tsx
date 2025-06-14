import { useCallback, useState } from "react";
import type { RefObject } from "react";
import { Marker } from "@react-google-maps/api";
import { InfoPanel } from "../InfoPanel/InfoPanel";

interface LocationButtonProps {
  mapRef: RefObject<google.maps.Map | null>;
}

export const LocationButton = ({ mapRef }: LocationButtonProps) => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);

  const handleShowMyLocation = useCallback(() => {
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
  }, [mapRef]);

  return (
    <>
      {/* User location marker */}
      {userLocation && (
        <>
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
            title="My Location"
            onClick={() => setIsSelected(!isSelected)}
          />
          {isSelected && (
            <InfoPanel
              position={{
                lat: userLocation.lat(),
                lng: userLocation.lng(),
              }}
              onClose={() => setIsSelected(false)}
            >
              <div style={{ fontWeight: "bold", marginBottom: "8px" }}>My Location</div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                Latitude: {userLocation.lat().toFixed(6)}
              </div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                Longitude: {userLocation.lng().toFixed(6)}
              </div>
              <div style={{ fontSize: "13px", color: "#666" }}>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </InfoPanel>
          )}
        </>
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
    </>
  );
};
