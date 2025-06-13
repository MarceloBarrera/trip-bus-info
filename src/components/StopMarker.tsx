import { OverlayView } from "@react-google-maps/api";
import type { Stop } from "../types/trip";
import { InfoPanel } from "./InfoPanel/InfoPanel";

interface StopMarkerProps {
  stop: Stop;
  isHovered: boolean;
  onMouseOver: () => void;
  onMouseOut: () => void;
  nextStop?: Stop;
  isFirstStop?: boolean;
  isLastStop?: boolean;
}

const getBackgroundColor = ({
  isFirstStop,
  isLastStop,
  isHovered,
}: {
  isFirstStop: boolean;
  isLastStop: boolean;
  isHovered: boolean;
}): string => {
  if (isFirstStop) return "#9C27B0";
  if (isLastStop) return "#FF9800";
  if (isHovered) return "#2E5CB8";
  return "#4A90E2";
};

export const StopMarker = ({
  stop,
  isHovered,
  onMouseOver,
  onMouseOut,
  nextStop,
  isFirstStop,
  isLastStop,
}: StopMarkerProps) => {
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
          data-testid="stop-marker"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: getBackgroundColor({
              isFirstStop: !!isFirstStop,
              isLastStop: !!isLastStop,
              isHovered,
            }),
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
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            {stop.location.name}
            {isFirstStop && (
              <span style={{ marginLeft: "8px", color: "#9C27B0", fontSize: "0.9em" }}>
                (Start)
              </span>
            )}
            {isLastStop && (
              <span style={{ marginLeft: "8px", color: "#FF9800", fontSize: "0.9em" }}>(End)</span>
            )}
          </div>
          <div style={{ fontSize: "13px", color: "#666" }}>
            Scheduled: {new Date(stop.departure.scheduled).toLocaleTimeString()}
          </div>
          {stop.departure.estimated && (
            <div style={{ fontSize: "13px", color: "#666" }}>
              Estimated: {new Date(stop.departure.estimated).toLocaleTimeString()}
            </div>
          )}
          {nextStop && (
            <>
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px solid #eee",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Next Stop: {nextStop.location.name}
              </div>
              <div style={{ fontSize: "13px", color: "#666" }}>
                Scheduled: {new Date(nextStop.departure.scheduled).toLocaleTimeString()}
                {nextStop.departure.estimated && (
                  <div>
                    Estimated: {new Date(nextStop.departure.estimated).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </>
          )}
        </InfoPanel>
      )}
    </div>
  );
};
