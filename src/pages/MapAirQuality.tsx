import { useState, useEffect } from "react";
import Slider from "rc-slider";
import { Map as MapComponent } from "../components/Map";
import { getSuburbsForApi } from "../requests/suburbs";
import { SuburbsIndexed, SuburbWithData, Api } from "../types";
import { applyRange } from "../util";
import { colorSuburb } from "../util/colorSuburb";
import { getAirQuality } from "../requests/airQuality";

import "leaflet/dist/leaflet.css";
import "rc-slider/assets/index.css";
import "./MapAirQuality.css";
import { RankingPanel } from "../components/RankingPanel/RankingPanel";

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

  useEffect(() => {
    const initialise = async () => {
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
    initialise();
  }, [apis]);

  let suburbsWithData: SuburbWithData[] = [];

  const sliderProps: SliderProps = {
    min: 0,
    max: 0,
    marks: {},
  };

  if (selectedMonth !== undefined) {
    const readings = airQualityData[selectedMonth];
    suburbsWithData = Object.keys(readings).map((suburbId) => {
      const id = parseInt(suburbId);
      return {
        ...suburbs[id],
        reading: readings[id],
        readingNormalised: 0,
      };
    });
  }

  suburbsWithData = applyRange(suburbsWithData);

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

  return (
    <div className="MapContainer">
      <MapComponent suburbs={suburbsWithData} selectedSuburb={selectedSuburb} />
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
        rankedList={suburbsWithData.map((suburb) => ({
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
