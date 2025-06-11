import { OverlayView } from "@react-google-maps/api";
import "./InfoPanel.css";

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
      <div className="info-panel">{children}</div>
    </OverlayView>
  );
};
