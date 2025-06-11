import { OverlayView } from "@react-google-maps/api";
import type { Vehicle, Stop } from "../types/trip";
import { InfoPanel } from "./InfoPanel/InfoPanel";

interface BusMarkerProps {
  position: {
    lat: number;
    lng: number;
  };
  vehicle: Vehicle;
  isHovered: boolean;
  onMouseOver: () => void;
  onMouseOut: () => void;
  delay: number;
  route: Stop[];
}

export const BusMarker = ({
  position,
  vehicle,
  isHovered,
  onMouseOver,
  onMouseOut,
  delay,
  route,
}: BusMarkerProps) => {
  const origin = route[0];
  const destination = route[route.length - 1];
  const departureTime = new Date(origin.departure.scheduled).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#FF0000",
            border: "2px solid white",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
            transform: isHovered ? "scale(1.2)" : "scale(1)",
          }}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        />
      </OverlayView>

      {isHovered && (
        <InfoPanel position={position}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{vehicle.name}</div>
          <div style={{ fontSize: "13px", color: "#333", marginBottom: "4px" }}>
            {departureTime} from {origin.location.name} to {destination.location.name}
          </div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
            Type: {vehicle.type}
          </div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
            Capacity: {vehicle.seat} seats
          </div>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
            Features:
            {vehicle.has_wifi && " WiFi"}
            {vehicle.has_toilet && " Toilet"}
            {vehicle.wheelchair > 0 && ` ${vehicle.wheelchair} Wheelchair spaces`}
            {vehicle.bicycle > 0 && ` ${vehicle.bicycle} Bike spaces`}
          </div>
          {delay !== 0 && (
            <div
              style={{
                fontSize: "13px",
                color: delay > 0 ? "#FF4444" : "#44BB44",
                fontWeight: "500",
                marginTop: "4px",
              }}
            >
              {delay > 0
                ? `Delayed by ${Math.round(delay / 60000)} minutes`
                : `Ahead by ${Math.abs(Math.round(delay / 60000))} minutes`}
            </div>
          )}
          {vehicle.gps && (
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Last updated: {new Date(vehicle.gps.last_updated).toLocaleTimeString()}
            </div>
          )}
        </InfoPanel>
      )}
    </div>
  );
};
