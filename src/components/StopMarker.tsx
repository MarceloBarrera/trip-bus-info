import { OverlayView } from "@react-google-maps/api";
import type { Stop } from "../types/trip";
import { InfoPanel } from "./InfoPanel";

interface StopMarkerProps {
  stop: Stop;
  isHovered: boolean;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

export const StopMarker = ({ stop, isHovered, onMouseOver, onMouseOut }: StopMarkerProps) => {
  return (
    <div>
      <OverlayView
        position={{
          lat: stop.location.lat,
          lng: stop.location.lon,
        }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: isHovered ? "#2E5CB8" : "#4A90E2",
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
        <InfoPanel
          position={{
            lat: stop.location.lat,
            lng: stop.location.lon,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>{stop.location.name}</div>
          <div style={{ fontSize: "13px", color: "#666" }}>
            Scheduled: {new Date(stop.departure.scheduled).toLocaleTimeString()}
          </div>
          {stop.departure.estimated && (
            <div style={{ fontSize: "13px", color: "#666" }}>
              Estimated: {new Date(stop.departure.estimated).toLocaleTimeString()}
            </div>
          )}
        </InfoPanel>
      )}
    </div>
  );
};
