import { OverlayView } from "@react-google-maps/api";
import styles from "./InfoPanel.module.css";

interface InfoPanelProps {
  position: {
    lat: number;
    lng: number;
  };
  children: React.ReactNode;
  onClose: () => void;
}

export const InfoPanel = ({ position, children, onClose }: InfoPanelProps) => {
  return (
    <>
      <OverlayView position={position} mapPaneName={OverlayView.FLOAT_PANE}>
        <div className={styles.infoPanel}>{children}</div>
      </OverlayView>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={onClose}
      />
    </>
  );
};
