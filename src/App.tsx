import "./App.css";
import { Map } from "./components/Map";
import { mockTrip2 } from "./mocks/mockTrip2";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map trip={mockTrip2} />
    </div>
  );
}

export default App;
