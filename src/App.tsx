import { useState, useEffect } from "react";
import { Map } from "./components/Map";
import { getYears } from "./requests/emissions";
import { getSuburbs, getEmissionsBySuburb } from "./requests/suburbs";
import { SuburbsIndexed, SuburbWithData, InputToggle, Emission } from "./types";
import { applyRange } from "./util";
import Slider from "rc-slider";
import { getCategories } from "./requests/categories";
import { colorSuburb } from "./util/colorSuburb";

import "leaflet/dist/leaflet.css";
import "rc-slider/assets/index.css";
import "./App.css";

function App() {
  type DataView = "aggregate" | "yearly";

  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [suburbs, setSuburbs] = useState<SuburbsIndexed>({});
  const [selectedSuburb, setSelectedSuburb] = useState<number | undefined>();
  const [categoryToggles, setCategoryToggles] = useState<InputToggle[]>([]);
  const [sortToggles, setSortToggles] = useState<InputToggle[]>([
    {
      id: 1,
      name: "Desc",
      on: true,
    },
    {
      id: 2,
      name: "Asc",
      on: false,
    },
  ]);
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
        const categoryToggles: InputToggle[] = categories.map((category) => ({
          ...category,
          on: true,
        }));
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
      const sort =
        sortToggles.find((sortToggle) => sortToggle.on)?.name.toLowerCase() ||
        "desc";
      const _emissions = await getEmissionsBySuburb(categories, year, sort);
      setEmissions(_emissions);
    };
    fetchEmissions();
  }, [year, categoryToggles, sortToggles]);

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
    marks: { [key: number]: { style: object; label: string } };
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
    .filter(
      (suburbWithdata) =>
        suburbWithdata.geoData && suburbWithdata.id && suburbWithdata.reading
    );

  suburbsWithData = applyRange(suburbsWithData);

  years.forEach((year) => {
    if (year < sliderProps.min) sliderProps.min = year;
    if (year > sliderProps.max) sliderProps.max = year;
    sliderProps.marks[year] = {
      style: { color: "white" },
      label: year.toString(),
    };
  });

  return (
    <div className="App">
      <div className="MapContainer">
        <Map suburbs={suburbsWithData} selectedSuburb={selectedSuburb}></Map>
        <div>
          <div className="AggregateTogglesContainer">
            <div className="AggregateToggles">
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
          </div>
          <div>
            {sortToggles.map((toggle, i) => (
              <span key={`sortToggle-${i}`}>
                <label htmlFor={toggle.name}>{toggle.name}</label>
                <input
                  type={"radio"}
                  name={toggle.name}
                  checked={toggle.on}
                  onChange={(e) =>
                    setSortToggles(
                      sortToggles.map((sortToggle) => ({
                        ...sortToggle,
                        on: toggle.id === sortToggle.id && e.target.checked,
                      }))
                    )
                  }
                ></input>
              </span>
            ))}
          </div>
        </div>
        <div className={"CategoryToggles"}>
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
        <div className="SuburbRankingPanel">
          <b>Ranking</b>
          {suburbsWithData.map((suburb, i) => {
            return (
              <div
                key={`rankedSuburb-${i}`}
                className={"Rank"}
                onMouseEnter={() => setSelectedSuburb(suburb.id)}
                style={{ color: colorSuburb(suburb.readingNormalised) }}
              >
                {i + 1}: <b>{suburb.name}</b>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
