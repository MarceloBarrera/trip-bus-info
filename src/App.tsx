import "./App.css";
import { Map } from "./components/Map";
import { mockTrip } from "./mocks/mockTrip";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map trip={mockTrip} />
    </div>
  );
}

export default App;
