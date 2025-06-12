import { mockTrip } from "../../src/mocks/mockTrip";
import { interceptGetViewPortInfo } from "../interceptors/interceptGetViewPortInfo";

describe("Map Component", () => {
  it("should render the map", () => {
    // Intercept the trip API call
    cy.intercept("GET", "**/trips/*", {
      statusCode: 200,
      body: mockTrip,
    }).as("getTrip");

    // intercept: https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true
    cy.intercept("GET", "**/maps/api/mapsjs/gen_204*", {
      statusCode: 200,
      body: {
        status: "OK",
      },
    }).as("getGen204");

    interceptGetViewPortInfo();

    // Visit the app with a trip ID
    cy.visit("http://localhost:5173?id=GrnisKd8ABak8d5Lxigqsh");

    // Wait for the API call to complete
    cy.wait("@getTrip");

    // Check if the map container is visible
    cy.get('[data-testid="map-container"]').should("be.visible");

    // Check for bus marker
    cy.get('[data-testid="bus-marker"]').should("exist");

    // Check for stop markers (should match mock data length)
    cy.get('[data-testid="stop-marker"]').should("have.length", mockTrip.route.length);
  });

  it("should handle 500 Server Error response", () => {
    cy.visit("http://localhost:5173?id=GrnisKd8ABak8d5Lxigqsh");

    // Intercept with an error
    cy.intercept("GET", "**/trips/*", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("getTripError");

    cy.wait("@getTripError");

    // check loading message
    cy.contains("Loading trip data...").should("be.visible");

    // Check for error message after 2 times automatic retries
    cy.wait(2000);
    cy.contains("Server error. Please try again later.").should("be.visible");
    cy.contains("home page").should("be.visible");
  });

  it("should handle 403 Forbidden response", () => {
    cy.visit("http://localhost:5173?id=GrnisKd8ABak8d5Lxigqsh");

    // Intercept with 403 Forbidden
    cy.intercept("GET", "**/trips/*", {
      statusCode: 403,
      body: { error: "Access denied" },
    }).as("getTripForbidden");

    cy.wait("@getTripForbidden");

    // check loading message
    cy.contains("Loading trip data...").should("be.visible");

    // Check for error message after retries
    cy.wait(2000);
    cy.contains("Access denied. You don't have permission to view this trip.").should("be.visible");
    cy.contains("home page").should("be.visible");
  });

  it("should handle 404 Not Found response", () => {
    cy.visit("http://localhost:5173?id=invalid-trip-id");

    // Intercept with 404 Not Found
    cy.intercept("GET", "**/trips/*", {
      statusCode: 404,
      body: { error: "Trip not found" },
    }).as("getTripNotFound");

    cy.wait("@getTripNotFound");

    // check loading message
    cy.contains("Loading trip data...").should("be.visible");

    // Check for error message after retries
    cy.wait(2000);
    cy.contains("Trip not found. Please check the trip ID.").should("be.visible");
    cy.contains("home page").should("be.visible");
  });
});
