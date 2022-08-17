import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Map } from "./components/Map";
import { getEmissions } from "./requests/emissions";

function App() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEmissions();
        console.log(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  });

  return (
    <div className="App">
      <Map></Map>
    </div>
  );
}

export default App;
