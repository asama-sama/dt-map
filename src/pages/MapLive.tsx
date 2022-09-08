import { useState, useEffect } from "react";
import { Map as MapComponent } from "../components/Map";
import { getSuburbsForApi } from "../requests/suburbs";
import { SuburbsIndexed, Api, SuburbWithMapData, Suburb } from "../types";
import { applyRange, NonNormalisedData } from "../util";
import { colorSuburb } from "../util/colorSuburb";
import {
  AirQualityCategories,
  AirQualityDataLive,
  getAirQualityLive,
} from "../requests/airQuality";
import { RankingPanel } from "../components/RankingPanel/RankingPanel";

import "leaflet/dist/leaflet.css";
import "rc-slider/assets/index.css";
import "./MapLive.css";

interface AirQualityData extends AirQualityDataLive {
  suburbId: number;
}

export const MapLive = ({
  suburbs,
  apis,
}: {
  suburbs: SuburbsIndexed;
  apis: Api[];
}) => {
  const [selectedSuburb, setSelectedSuburb] = useState<number | undefined>();
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
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

        const airQualityReadings = await getAirQualityLive(sites);
        const airQualityData: AirQualityData[] = [];
        for (const airQualityReading of airQualityReadings) {
          const suburbId = metaSuburbIdLookup[airQualityReading.siteId];
          airQualityData.push({
            ...airQualityReading,
            suburbId,
          });
          // airQualityData[suburbId] = airQualityReading.value;
        }
        setAirQualityData(airQualityData);
      }
    };
    initialiseAQApi();
  }, [apis]);

  const airQualityToMapping = (category: AirQualityCategories) => {
    if (category === null) return null;
    const categoryToValue = {
      GOOD: 0,
      FAIR: 0.25,
      POOR: 0.5,
      "VERY POOR": 0.75,
      "EXTREMELY POOR": 1,
    };
    const value = categoryToValue[category];
    return value;
  };

  const suburbsWithOriginalReading: NonNormalisedData<Suburb>[] =
    airQualityData.map((data) => ({
      ...suburbs[data.suburbId],
      reading: data.value,
    }));

  const suburbsWithData: NonNormalisedData<SuburbWithMapData>[] =
    airQualityData.map((data) => {
      return {
        ...suburbs[data.suburbId],
        reading: airQualityToMapping(data.quality),
        description: `${suburbs[data.suburbId].name}: ${
          data.hourDescription
        }, ${data.quality}, ${data.value}`,
      };
    });
  const suburbsNormalised = applyRange(suburbsWithData);

  return (
    <div className="MapContainer">
      <MapComponent
        suburbs={suburbsNormalised}
        selectedSuburb={selectedSuburb}
      />
      <RankingPanel
        rankedList={suburbsWithOriginalReading.map((suburb) => ({
          id: suburb.id,
          value: suburb.reading,
          name: suburb.name,
        }))}
        onMouseEnter={(id) => setSelectedSuburb(id)}
        coloring={colorSuburb}
      />
    </div>
  );
};
