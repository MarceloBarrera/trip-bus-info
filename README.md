# Trip info app

Displays a trip information including Route, Stops, Bus Location and My Location using Google Console Cloud Services (Maps Javascript API https://developers.google.com/maps/documentation/javascript and Directions API https://developers.google.com/maps/documentation/directions)

The app **needs a valid trip ID** to display the Map of the trip that could be obtained from the following endpoint (You might need to change the dates to query more recent or future trips.):

```
curl --location https://api.ember.to/v1/quotes/?origin=42&destination=13&departure_date_from=2025-06-14T23:09:17.789Z&departure_date_to=2025-06-16T23:09:17.789Z

```

From the response look for "trip_uid" and use it as query param when running the app, example: https://guileless-biscuit-9097e8.netlify.app/?id=7yzmR5fYDHiAFZVmJjK2RC or http://localhost:5173/?id=LW3sUeNWFfWp85hMbGmkih when running locally.

## App valid url

The app is hosted https://guileless-biscuit-9097e8.netlify.app/?id=7yzmR5fYDHiAFZVmJjK2RC
The idea is to text or email this URL for example to a passenger that needs information about its trip or route.

## Technical approach details

- Use @react-google-maps/api to interact with Google Cloud Services. I have created a Google Account with valid token that might be billed, but since app is for testing purposes it is ok.
- Added RouteLine marker to draw the Route of the Trip using the Direction Service from Google APis. Adding a fallback basic Polyline drawer if Service is not available or something wrong.
- Using some functionality out of the box, like Zooming, Camera and Full screen controls.
- Added Stop and Bus Markers to represent the location of Stops and the Bus along the route, when selecting the markers an Info Panel pops up to show relevant information about the stop, the bus and the trip or route.
- Added Show My Location button, to show users Location if the user allows.
- Different circle colors represent the Bus, the Stop, the MyLocation, The start and End of the route.

- Added react-query to interact with BE endpoint apis.
- Added vitest with coverage to see some test coverage reports.
- Added Cypress to test some e2e test case scenarios.
- Added css with modules.

## Running the app locally

- run `pnpm i` to install all necessary dependencies to run the app.
- use `pnpm dev` command to run the app locally at http://localhost:5173/?id={guid}, get an id from the api endpoint described above.
- When running the app without a valid Google Maps api key then you might see For development purposes only.
- The app is fully deployed at https://guileless-biscuit-9097e8.netlify.app/?id={guid} to see it in action.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
