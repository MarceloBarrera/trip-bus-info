import { OverlayView } from "@react-google-maps/api";
import type { Vehicle, Stop } from "../../types/trip";
import { InfoPanel } from "../InfoPanel/InfoPanel";

interface BusMarkerProps {
  position: {
    lat: number;
    lng: number;
  };
  vehicle: Vehicle;
  onSelected?: () => void;
  onClose: () => void;
  isSelected?: boolean;
  delay: number;
  route: Stop[];
}

export const BusMarker = ({
  position,
  vehicle,
  onSelected,
  onClose,
  isSelected,
  delay,
  route,
}: BusMarkerProps) => {
  const origin = route[0];
  const destination = route[route.length - 1];
  const departureTime = new Date(origin.departure.scheduled).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate estimated arrival time at final destination
  const getEstimatedArrival = () => {
    const scheduledArrival = new Date(destination.departure.scheduled);
    const estimatedArrival = new Date(scheduledArrival.getTime() + delay);
    return estimatedArrival.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Find the next stop based on the bus's current position
  const findNextStop = () => {
    if (!vehicle.gps) return null;

    // Find the last passed stop
    const lastPassedStopIndex = route.findIndex((stop) => {
      const stopTime = new Date(stop.departure.scheduled).getTime();
      const currentTime = new Date(vehicle.gps.last_updated).getTime();
      return stopTime > currentTime;
    });

    // If we found a stop that hasn't been passed yet, return it
    if (lastPassedStopIndex !== -1) {
      return route[lastPassedStopIndex];
    }

    // If all stops have been passed, return null
    return null;
  };

  const nextStop = findNextStop();

  return (
    <div>
      <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
        <div
          data-testid="bus-marker"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#FF0000",
            border: "2px solid white",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
            transform: isSelected ? "scale(1.2)" : "scale(1)",
          }}
          onClick={onSelected}
        />
      </OverlayView>

      {isSelected && (
        <InfoPanel position={position} onClose={onClose}>
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
          {nextStop && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid #eee",
                fontSize: "13px",
                color: "#666",
              }}
            >
              <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                Next Stop: {nextStop.location.name}
              </div>
              <div>Scheduled: {new Date(nextStop.departure.scheduled).toLocaleTimeString()}</div>
              {nextStop.departure.estimated && (
                <div>Estimated: {new Date(nextStop.departure.estimated).toLocaleTimeString()}</div>
              )}
            </div>
          )}
          <div
            style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #eee",
              fontSize: "13px",
              color: "#666",
            }}
          >
            <div style={{ fontWeight: "500", marginBottom: "4px" }}>
              Final Destination: {destination.location.name}
            </div>
            <div>Scheduled: {new Date(destination.departure.scheduled).toLocaleTimeString()}</div>
            <div style={{ color: delay !== 0 ? (delay > 0 ? "#FF4444" : "#44BB44") : "#666" }}>
              Estimated: {getEstimatedArrival()}
            </div>
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
