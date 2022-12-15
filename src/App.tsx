import { Routes, Route, Link } from "react-router-dom";
import { CosEmissionsMap } from "./pages/CosEmissionsMap";

import "./App.css";
import { AirQualityXTrafficIncidents } from "./pages/AirQualityXTrafficIncidents";

import "rc-slider/assets/index.css";

function App() {
  return (
    <div className="App">
      <nav className="Routes">
        <Link to="/">Ghg Emissions</Link>
        <Link to="/comparisons">Comparisons</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CosEmissionsMap />} />
        <Route path="/comparisons" element={<AirQualityXTrafficIncidents />} />
      </Routes>
    </div>
  );
}

export default App;
