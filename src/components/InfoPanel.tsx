import { OverlayView } from "@react-google-maps/api";

interface InfoPanelProps {
  position: {
    lat: number;
    lng: number;
  };
  children: React.ReactNode;
}

export const InfoPanel = ({ position, children }: InfoPanelProps) => {
  return (
    <OverlayView position={position} mapPaneName={OverlayView.FLOAT_PANE}>
      <div
        style={{
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          minWidth: "200px",
          border: "1px solid #E0E0E0",
          pointerEvents: "none",
          transform: "translate(-50%, -100%)",
          marginTop: "-10px",
        }}
      >
        {children}
      </div>
    </OverlayView>
  );
};
