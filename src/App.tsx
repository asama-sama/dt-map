import { Routes, Route, Link } from "react-router-dom";
import { CosEmissionsMap } from "./pages/CosEmissionsMap";

import "./App.css";

function App() {
  return (
    <div className="App">
      <nav className="Routes">
        <Link to="/">Map</Link>
        <Link to="/airquality">Air Quality Map</Link>
        <Link to="/live">Live Map</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/yearly">Yearly</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CosEmissionsMap />} />
      </Routes>
    </div>
  );
}

export default App;
