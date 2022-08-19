import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Map } from "./components/Map";
import {
  getEmissionsAggregate,
  getEmissionsAggregateYearly,
} from "./requests/emissions";
import { getSuburbs } from "./requests/suburbs";
import {
  SuburbsIndexed,
  SuburbWithData,
  EmissionsAggregate,
  YearSuburbMap,
} from "./types";
import { applyRange } from "./util";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function App() {
  type DataView = "aggregate" | "yearly";

  const [emissionsAggregate, setEmissionsAggregate] = useState<
    EmissionsAggregate[]
  >([]);
  const [emissionsYearAggregate, setEmissionsYearAggregate] =
    useState<YearSuburbMap>({});
  const [suburbs, setSuburbs] = useState<SuburbsIndexed>({});
  const [dataView, setDataView] = useState<DataView>("aggregate");
  const [year, setYear] = useState<number>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suburbs = await getSuburbs();
        const suburbsMap: SuburbsIndexed = {};
        suburbs.map((suburb) => (suburbsMap[suburb.id] = suburb));
        setSuburbs(suburbsMap);
        const emissionsAggregate = await getEmissionsAggregate();
        setEmissionsAggregate(emissionsAggregate);
        const emissionsSuburbsYearly = await getEmissionsAggregateYearly();
        setEmissionsYearAggregate(emissionsSuburbsYearly);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  let suburbsWithData: SuburbWithData[] = [];

  type SliderProps = {
    min: number;
    max: number;
    marks: { [key: number]: string };
  };

  const sliderProps: SliderProps = {
    min: 9e10,
    max: 0,
    marks: {},
  };

  if (dataView === "aggregate") {
    suburbsWithData = emissionsAggregate.map((emission) => ({
      ...suburbs[emission.suburbId],
      reading: emission.reading,
    }));
  } else {
    Object.keys(emissionsYearAggregate).forEach((yearStr, i) => {
      const yearInt = parseInt(yearStr);
      if (yearInt < sliderProps.min) sliderProps.min = yearInt;
      if (yearInt > sliderProps.max) sliderProps.max = yearInt;
      sliderProps.marks[yearInt] = yearStr;
      if (i === 0 && !year) {
        if (!year) setYear(yearInt);
      }
    });
    if (year) {
      const yearlyEmissionsBySuburb = emissionsYearAggregate[year];
      suburbsWithData = yearlyEmissionsBySuburb.map((emission) => ({
        ...suburbs[emission.suburbId],
        reading: emission.reading,
      }));
    }
  }

  suburbsWithData = suburbsWithData.filter(
    (suburbWithdata) => suburbWithdata.geoData && suburbWithdata.id
  );

  const suburbAggregateEmissionsRanged = applyRange(suburbsWithData);
  return (
    <div className="App">
      <Map suburbs={suburbAggregateEmissionsRanged}></Map>
      <div>
        <label>
          Aggregate
          <input
            type="radio"
            name="dataSelection"
            onChange={() => setDataView("aggregate")}
            checked={dataView === "aggregate"}
          ></input>
        </label>
        <label>
          Yearly
          <input
            type="radio"
            name="dataSelection"
            onChange={() => setDataView("yearly")}
            checked={dataView === "yearly"}
          ></input>
        </label>
      </div>
      {dataView === "yearly" ? (
        <Slider
          marks={sliderProps.marks}
          step={null}
          min={sliderProps.min}
          max={sliderProps.max}
          onChange={(year) => {
            if (!Array.isArray(year)) {
              setYear(year);
            }
          }}
          value={year}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
