import { Marker } from "@react-google-maps/api";
import type { Stop } from "../types/trip";
import { InfoPanel } from "./InfoPanel/InfoPanel";

// TODO: Migrate to AdvancedMarkerElement when available in @react-google-maps/api
// As of February 21st, 2024, google.maps.Marker is deprecated.
// AdvancedMarkerElement will provide better performance and features.
// https://github.com/JustFly1984/react-google-maps-api/issues?q=is%3Aissue%20state%3Aopen%20AdvancedMarkerElement

interface StopMarkerProps {
  stop: Stop;
  onSelected?: (stopId: number) => void;
  onClose: () => void;
  isSelected?: boolean;
  nextStop?: Stop;
  isFirstStop?: boolean;
  isLastStop?: boolean;
}

const getBackgroundColor = ({
  isFirstStop,
  isLastStop,
  isSelected,
}: {
  isFirstStop: boolean;
  isLastStop: boolean;
  isSelected: boolean;
}): string => {
  if (isFirstStop) return "#9C27B0";
  if (isLastStop) return "#FF9800";
  if (isSelected) return "#2E5CB8";
  return "#4A90E2";
};

export const StopMarker = ({
  stop,
  onSelected,
  onClose,
  isSelected,
  nextStop,
  isFirstStop,
  isLastStop,
}: StopMarkerProps) => {
  return (
    <div>
      <div data-testid="stop-marker">
        <Marker
          position={{
            lat: stop.location.lat,
            lng: stop.location.lon,
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: getBackgroundColor({
              isFirstStop: !!isFirstStop,
              isLastStop: !!isLastStop,
              isSelected: !!isSelected,
            }),
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          }}
          clickable={true}
          onClick={() => onSelected?.(stop.id)}
        />
      </div>

      {isSelected && (
        <InfoPanel
          position={{
            lat: stop.location.lat,
            lng: stop.location.lon,
          }}
          onClose={onClose}
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
                <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                  Next Stop: {nextStop.location.name}
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  Scheduled: {new Date(nextStop.departure.scheduled).toLocaleTimeString()}
                </div>
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
