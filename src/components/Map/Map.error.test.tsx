import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockTrip } from "../../mocks/mockTrip";

// Mock Google Maps API to simulate loadError
vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({
    isLoaded: false,
    loadError: new Error("Failed to load Google Maps"),
  }),
  GoogleMap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-map">{children}</div>
  ),
  OverlayView: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="overlay">{children}</div>
  ),
  Polyline: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="polyline">{children}</div>
  ),
}));

// Mock environment variables
vi.stubGlobal("import.meta", {
  env: {
    VITE_GOOGLE_MAPS_API_KEY: "fake-api-key",
  },
});

// Mock google object
vi.stubGlobal("google", {
  maps: {
    ControlPosition: {
      TOP_RIGHT: 1,
      RIGHT_BOTTOM: 2,
    },
    MapTypeControlStyle: {
      DROPDOWN_MENU: 2,
    },
  },
});

import { Map } from "./Map";

describe("Map Component (error scenario)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error loading google maps", () => {
    render(<Map trip={mockTrip} isBusLocationOutdated={false} />);
    expect(screen.getByText(/Error loading Google Maps/i)).toBeInTheDocument();
  });
});
