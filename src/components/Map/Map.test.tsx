import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockTrip } from "../../mocks/mockTrip";
import { Map } from "./Map";

// Mock all Google Maps related modules
vi.mock("@react-google-maps/api", async (importOriginal) => ({
  ...(await importOriginal()),
  useJsApiLoader: () => ({
    isLoaded: true,
    loadError: undefined,
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

describe("Map Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders markers and map without crashing", () => {
    render(<Map trip={mockTrip} isBusLocationOutdated={false} />);
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
    expect(screen.queryAllByTestId("bus-marker").length).toBe(1);
    expect(screen.queryAllByTestId("stop-marker").length).toBe(mockTrip.route.length);
  });

  it("should show bus location outdated warning", () => {
    render(<Map trip={mockTrip} isBusLocationOutdated={true} />);
    expect(screen.getByText(/Bus location may be outdated/i)).toBeInTheDocument();
  });
});
