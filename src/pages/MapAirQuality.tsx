import { useState, useEffect } from "react";
import Slider from "rc-slider";
import { Map as MapComponent } from "../components/Map";
import { getSuburbsForApi } from "../requests/suburbs";
import { SuburbsIndexed, Api, Suburb } from "../types";
import { applyRange, NonNormalisedData } from "../util";
import { colorSuburb } from "../util/colorSuburb";
import { getAirQuality } from "../requests/airQuality";
import { RankingPanel } from "../components/RankingPanel/RankingPanel";
import {
  getMonthlyCountsForYear,
  getStations,
  Station,
  TrafficCount,
} from "../requests/trafficVolume";

import "leaflet/dist/leaflet.css";
import "rc-slider/assets/index.css";
import "./MapAirQuality.css";

type AirQualityData = {
  [key: string]: {
    [key: number]: number;
  };
};

type SliderProps = {
  min: number;
  max: number;
  marks: { [key: number]: { style: object; label: string } };
};

export const MapAirQuality = ({
  suburbs,
  apis,
}: {
  suburbs: SuburbsIndexed;
  apis: Api[];
}) => {
  const [selectedSuburb, setSelectedSuburb] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number>();
  const [airQualityData, setAirQualityData] = useState<AirQualityData>({});
  const [stations, setStations] = useState<{ [key: string]: Station }>({});
  const [trafficCounts, setTrafficCounts] = useState<TrafficCount[]>([]);

  useEffect(() => {
    const initialiseAQApi = async () => {
      const nswAirQualityApi = apis.find(
        (api) => api.name === "NSW_AIR_QUALITY"
      );
      if (nswAirQualityApi) {
        const nswApiSuburbs = await getSuburbsForApi(nswAirQualityApi.id);
        const metaSuburbIdLookup: { [key: number]: number } = {};
        nswApiSuburbs.forEach((nswApiSuburb) => {
          metaSuburbIdLookup[nswApiSuburb.meta.siteId] = nswApiSuburb.id;
        });
        const sites = nswApiSuburbs.map(
          (nswApiSuburb) => nswApiSuburb.meta.siteId
        );

        const airQualityReadings = await getAirQuality(sites);
        const airQualityData: AirQualityData = {};
        for (const airQualityReading of airQualityReadings) {
          const { month } = airQualityReading;
          if (!airQualityData[month]) {
            airQualityData[month] = {};
          }
          const suburbid = metaSuburbIdLookup[airQualityReading.siteId];

          airQualityData[month][suburbid] = airQualityReading.value;
        }
        setAirQualityData(airQualityData);
        const months = Object.keys(airQualityData).map(Number);
        setSelectedMonth(months[months.length - 1]);
      }
    };
    const initialiseTrafficVolumeApi = async () => {
      const stations = await getStations();
      setStations(stations);
      const trafficCounts = await getMonthlyCountsForYear(
        2022,
        Object.keys(stations).map(Number)
      );
      setTrafficCounts(trafficCounts);
    };
    initialiseAQApi();
    initialiseTrafficVolumeApi();
  }, [apis]);

  const readings =
    (selectedMonth !== undefined && airQualityData[selectedMonth]) || [];
  const suburbsWithData: NonNormalisedData<Suburb>[] = Object.keys(
    readings
  ).map((suburbId) => {
    const id = parseInt(suburbId);
    return {
      ...suburbs[id],
      reading: readings[id],
    };
  });

  const suburbsNormalised = applyRange(suburbsWithData);

  const sliderProps: SliderProps = {
    min: 0,
    max: 0,
    marks: {},
  };
  Object.keys(airQualityData).forEach((month) => {
    const monthInt = parseInt(month);
    const currentDate = new Date();
    const label = new Date(
      `${currentDate.getFullYear()}-${monthInt + 1}`
    ).toLocaleDateString(undefined, {
      month: "short",
    });
    if (monthInt > sliderProps.max) sliderProps.max = monthInt;
    sliderProps.marks[monthInt] = {
      style: { color: "white" },
      label,
    };
  });

  const countsNormalised = applyRange(
    trafficCounts.map((trafficCount) => ({
      ...trafficCount,
      reading: trafficCount.count,
    }))
  ).filter((count) => count.month === selectedMonth);

  return (
    <div className="MapContainer">
      <MapComponent
        suburbs={suburbsNormalised}
        selectedSuburb={selectedSuburb}
        stations={stations}
        trafficCounts={countsNormalised}
      />
      <div className={"SliderContainer"}>
        <div className="Slider">
          <Slider
            marks={sliderProps.marks}
            step={null}
            min={sliderProps.min}
            max={sliderProps.max}
            onChange={(month) => {
              if (!Array.isArray(month)) {
                setSelectedMonth(month);
              }
            }}
            value={selectedMonth}
          />
        </div>
      </div>
      <RankingPanel
        rankedList={suburbsNormalised.map((suburb) => ({
          id: suburb.id,
          value: suburb.readingNormalised,
          name: suburb.name,
        }))}
        onMouseEnter={(id) => setSelectedSuburb(id)}
        coloring={colorSuburb}
      />
    </div>
  );
};
