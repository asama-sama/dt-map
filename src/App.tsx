import { Routes, Route, Link } from "react-router-dom";
import { CosEmissionsMap } from "./pages/CosEmissionsMap";

import "./App.css";
import { AirQualityXTrafficIncidents } from "./pages/AirQualityXTrafficIncidents";

import "rc-slider/assets/index.css";

function App() {
  return (
    <div className="App">
      <div className="banner">
        This project is in beta. There may be issues when multiple users are
        accessing the application.
      </div>
      <nav className="Routes">
        <Link to="/">Single Source</Link>
        <Link to="/comparisons">Comparisons</Link>
      </nav>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Routes>
          <Route path="/" element={<CosEmissionsMap />} />
          <Route
            path="/comparisons"
            element={<AirQualityXTrafficIncidents />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
