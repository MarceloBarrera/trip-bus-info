import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BusMarker } from "./BusMarker";
import { mockTrip } from "../../mocks/mockTrip";

// Mock the Google Maps API
vi.mock("@react-google-maps/api", () => ({
  OverlayView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="overlay">{children}</div>
  ),
}));

describe("BusMarker Component", () => {
  const defaultProps = {
    position: { lat: 55.95395, lng: -3.19549 },
    vehicle: mockTrip.vehicle,
    isHovered: false,
    onMouseOver: vi.fn(),
    onMouseOut: vi.fn(),
    delay: 0,
    route: mockTrip.route,
  };

  it("renders without crashing", () => {
    render(<BusMarker {...defaultProps} />);
    expect(screen.getByTestId("overlay")).toBeInTheDocument();
  });

  it("shows vehicle info when hovered", () => {
    render(<BusMarker {...defaultProps} isHovered={true} />);
    expect(screen.getByText(mockTrip.vehicle.name)).toBeInTheDocument();
    expect(screen.getByText(/Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Capacity:/)).toBeInTheDocument();
  });

  it("shows route information when hovered", () => {
    render(<BusMarker {...defaultProps} isHovered={true} />);
    const origin = mockTrip.route[0].location.name;
    const destination = mockTrip.route[mockTrip.route.length - 1].location.name;
    expect(
      screen.getByText(`from ${origin} to ${destination}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("shows delay information when there is a delay", () => {
    const delay = 5 * 60 * 1000; // 5 minutes in milliseconds
    render(<BusMarker {...defaultProps} isHovered={true} delay={delay} />);
    expect(screen.getByText(/Delayed by 5 minutes/)).toBeInTheDocument();
  });

  it("shows ahead information when bus is ahead of schedule", () => {
    const delay = -5 * 60 * 1000; // -5 minutes in milliseconds
    render(<BusMarker {...defaultProps} isHovered={true} delay={delay} />);
    expect(screen.getByText(/Ahead by 5 minutes/)).toBeInTheDocument();
  });

  it("calls onMouseOver when mouse enters marker", () => {
    render(<BusMarker {...defaultProps} />);
    const marker = screen.getByTestId("overlay").firstChild as HTMLElement;
    fireEvent.mouseOver(marker);
    expect(defaultProps.onMouseOver).toHaveBeenCalled();
  });

  it("calls onMouseOut when mouse leaves marker", () => {
    render(<BusMarker {...defaultProps} />);
    const marker = screen.getByTestId("overlay").firstChild as HTMLElement;
    fireEvent.mouseOut(marker);
    expect(defaultProps.onMouseOut).toHaveBeenCalled();
  });
});
