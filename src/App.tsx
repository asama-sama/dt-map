import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Map } from "./components/Map";
import { getEmissions } from "./requests/emissions";
import { Suburb, Emission } from "./types";

function App() {
  const [emissions, setEmissions] = useState<Emission[]>();
  const [suburbs, setSuburbs] = useState<Suburb[]>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEmissions();
        console.log(data);
        setEmissions(data.emissions);
        setSuburbs(data.suburbs);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      <Map suburbs={suburbs}></Map>
    </div>
  );
}

export default App;
