import { Routes, Route, Link } from "react-router-dom";
import { CosEmissionsMap } from "./pages/CosEmissionsMap";

import "./App.css";
import { AirQualityXTrafficIncidents } from "./pages/AirQualityXTrafficIncidents";

function App() {
  return (
    <div className="App">
      <nav className="Routes">
        <Link to="/">Map</Link>
        <Link to="/airQuality-trafficIncidents">Air Quality x Incidents</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CosEmissionsMap />} />
        <Route
          path="/airQuality-trafficIncidents"
          element={<AirQualityXTrafficIncidents />}
        />
      </Routes>
    </div>
  );
}

export default App;
