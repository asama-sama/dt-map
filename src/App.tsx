import { useState, useEffect } from "react";
import { Map } from "./components/Map";
import { getEmissions, getYears } from "./requests/emissions";
import { getSuburbs } from "./requests/suburbs";
import {
  SuburbsIndexed,
  SuburbWithData,
  CategoryToggle,
  Emission,
} from "./types";
import { applyRange } from "./util";
import Slider from "rc-slider";
import { getCategories } from "./requests/categories";

import "leaflet/dist/leaflet.css";
import "rc-slider/assets/index.css";
import "./App.css";
import MapControlStyles from "./MapControls.css";

function App() {
  type DataView = "aggregate" | "yearly";

  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [suburbs, setSuburbs] = useState<SuburbsIndexed>({});
  const [categoryToggles, setCategoryToggles] = useState<CategoryToggle[]>([]);
  const [dataView, setDataView] = useState<DataView>("aggregate");
  const [year, setYear] = useState<number>();
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const suburbs = await getSuburbs();
        const suburbsMap: SuburbsIndexed = {};
        suburbs.map((suburb) => (suburbsMap[suburb.id] = suburb));
        setSuburbs(suburbsMap);
        const categories = await getCategories();
        const categoryToggles: CategoryToggle[] = categories.map(
          (category) => ({
            ...category,
            on: true,
          })
        );
        setCategoryToggles(categoryToggles);
        const _years = await getYears();
        setYears(_years);
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchEmissions = async () => {
      const categories = categoryToggles
        .filter((categoryToggle) => categoryToggle.on)
        .map((categoryToggle) => categoryToggle.id);
      const _emissions = await getEmissions(categories, year);
      setEmissions(_emissions);
    };
    fetchEmissions();
  }, [year, categoryToggles]);

  const handleToggleDataView = (dataView: DataView) => {
    if (dataView === "aggregate") {
      setYear(undefined);
    } else if (dataView === "yearly") {
      setYear(years[0]);
    }
    setDataView(dataView);
  };

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

  suburbsWithData = emissions
    .map((emission) => ({
      ...suburbs[emission.suburbId],
      reading: emission.reading,
    }))
    .filter((suburbWithdata) => suburbWithdata.geoData && suburbWithdata.id);

  suburbsWithData = applyRange(suburbsWithData);
  years.forEach((year) => {
    if (year < sliderProps.min) sliderProps.min = year;
    if (year > sliderProps.max) sliderProps.max = year;
    sliderProps.marks[year] = year.toString();
  });

  return (
    <div className="App">
      <Map suburbs={suburbsWithData}></Map>
      <div>
        <label>
          Aggregate
          <input
            type="radio"
            name="dataSelection"
            onChange={() => handleToggleDataView("aggregate")}
            checked={dataView === "aggregate"}
          ></input>
        </label>
        <label>
          Yearly
          <input
            type="radio"
            name="dataSelection"
            onChange={() => handleToggleDataView("yearly")}
            checked={dataView === "yearly"}
          ></input>
        </label>
      </div>
      <div className={"MapToggles"}>
        {categoryToggles.map((categoryToggle, i) => (
          <div key={`toggle-${i}`} className="Selection">
            <label key={`cat-${i}`} htmlFor={`toggle-${i}`}>
              {categoryToggle.name}
            </label>
            <input
              id={`toggle-${i}`}
              name={`toggle-${i}`}
              type="checkbox"
              value={categoryToggle.id}
              checked={categoryToggle.on}
              onChange={(e) => {
                const newCategoriesToggles = categoryToggles.map(
                  (categoryToggle, j) => {
                    if (i === j) {
                      return {
                        ...categoryToggle,
                        on: e.target.checked,
                      };
                    } else {
                      return categoryToggle;
                    }
                  }
                );
                setCategoryToggles(newCategoriesToggles);
              }}
            ></input>
          </div>
        ))}
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
