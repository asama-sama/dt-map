import { useState, useEffect } from "react";
import Slider from "rc-slider";
import { Map as MapComponent } from "../components/Map";
import { Toggles } from "../components/Toggles";
import {
  SuburbResponseValue,
  getEmissionsBySuburb,
  getYears,
  getCategories,
} from "../requests/cosGhgEmissions";
import { InputToggle, Suburb } from "../types";
import { applyRange } from "../util";
import { colorSuburb } from "../util/colorSuburb";
import { globalSuburbState } from "../state/global";

import "leaflet/dist/leaflet.css";
import "rc-slider/assets/index.css";
import "./Map.css";
import { useHookstate } from "@hookstate/core";
import { getSuburbs } from "../requests/suburbs";

export const CosEmissionsMap = () => {
  type DataView = "aggregate" | "yearly";

  const suburbState = useHookstate(globalSuburbState);
  const suburbs = suburbState.get();

  const [emissions, setEmissions] = useState<SuburbResponseValue[]>([]);
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
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number>();

  useEffect(() => {
    const fetchEmissions = async () => {
      const categories = categoryToggles
        .filter((categoryToggle) => categoryToggle.on)
        .map((categoryToggle) => categoryToggle.id);
      const sort =
        sortToggles.find((sortToggle) => sortToggle.on)?.name.toLowerCase() ||
        "desc";
      let yearParam;
      if (dataView === "yearly") {
        yearParam = year;
      }
      const _emissions = await getEmissionsBySuburb(
        categories,
        yearParam,
        sort
      );
      setEmissions(_emissions);
    };

    fetchEmissions();
  }, [year, dataView, categoryToggles, sortToggles]);

  useEffect(() => {
    const fetchYears = async () => {
      const years = await getYears();
      setYears(years);
    };
    fetchYears();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const toggles = (await getCategories()).map((cat) => ({
        ...cat,
        on: true,
      }));
      setCategoryToggles(toggles);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const suburbIdsToFetch = emissions
      .filter(({ suburbId }) => {
        return !suburbs[suburbId];
      })
      .map(({ suburbId }) => suburbId);
    if (suburbIdsToFetch.length === 0) return;
    getSuburbs(suburbIdsToFetch).then((fetchedSuburbs) => {
      const fetchedSuburbsMap: { [key: number]: Suburb } = {};
      fetchedSuburbs.forEach((fetchedSuburb) => {
        if (fetchedSuburb.name === "SYDNEY") return; // ignore sydney for now as it is way higher than all other suburbs. TODO: all toggling of suburbs
        fetchedSuburbsMap[fetchedSuburb.id] = fetchedSuburb;
      });
      suburbState.merge(() => fetchedSuburbsMap);
    });
  }, [emissions]);

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

  const suburbsWithData = emissions
    .map((emission) => ({
      ...suburbs[emission.suburbId],
      reading: emission.value,
    }))
    .filter(
      (suburbWithdata) =>
        suburbWithdata.boundary && suburbWithdata.id && suburbWithdata.reading
    );

  const suburbsWithDataNormalised = applyRange(suburbsWithData);
  years.forEach((year) => {
    if (year < sliderProps.min) sliderProps.min = year;
    if (year > sliderProps.max) sliderProps.max = year;
    sliderProps.marks[year] = {
      style: { color: "white" },
      label: year.toString(),
    };
  });

  return (
    <div className="MapContainer">
      <MapComponent
        suburbs={suburbsWithDataNormalised}
        selectedSuburb={undefined}
      />
      <div className={"CategoryToggles"}>
        <h3>Categories</h3>
        <Toggles
          toggleInputs={categoryToggles}
          setToggleInputs={setCategoryToggles}
        />
        <div>
          <h3>Temporal</h3>
          <label className="PadRight">
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
          <h3>Rank</h3>
          <div>
            {sortToggles.map((toggle, i) => (
              <span key={`sortToggle-${i}`} className="PadRight">
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
      </div>
      {dataView === "yearly" ? (
        <div className={"SliderPanel"}>
          <Slider
            marks={sliderProps.marks}
            step={null}
            min={sliderProps.min}
            max={sliderProps.max}
            onChange={(year) => {
              if (!Array.isArray(year)) {
                setYear(year);
              }
              setSelectedSuburb(undefined);
            }}
            value={year}
          />
        </div>
      ) : (
        <></>
      )}
      <div className="SuburbRankingPanel">
        <b>Ranking</b>
        {suburbsWithDataNormalised.map((suburb, i) => {
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
  );
};
