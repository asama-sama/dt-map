import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Map } from "./components/Map";
import {
  EmissionsAggregate,
  getEmissions,
  getEmissionsAggregate,
} from "./requests/emissions";
import { getSuburbs } from "./requests/suburbs";
import { Suburb, Emission, SuburbAggregateEmission } from "./types";
import { applyRange } from "./util";

function App() {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [emissionsAggregate, setEmissionsAggregate] = useState<
    EmissionsAggregate[]
  >([]);
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suburbs = await getSuburbs();
        setSuburbs(suburbs);
        const emissionsAggregate = await getEmissionsAggregate();
        setEmissionsAggregate(emissionsAggregate);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const suburbAggregateEmissions: SuburbAggregateEmission[] = suburbs.map(
    (suburb) => {
      return {
        ...suburb,
        reading: emissionsAggregate.find(
          (emmAgg) => emmAgg.suburbId === suburb.id
        )?.suburbAggregateEmission,
      };
    }
  );

  const suburbAggregateEmissionsRanged = applyRange(suburbAggregateEmissions);

  return (
    <div className="App">
      <Map suburbs={suburbAggregateEmissionsRanged}></Map>
    </div>
  );
}

export default App;
