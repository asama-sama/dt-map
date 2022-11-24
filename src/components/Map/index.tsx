import { GeoJSON as GeoJSONType } from "leaflet";
import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Circle, Popup } from "react-leaflet";
import { Station, TrafficCount } from "../../requests/trafficVolume";
import { Suburb } from "../../types";
import { NormalisedData } from "../../util";
import { colorSuburb } from "../../util/colorSuburb";

const GeoLayer = ({
  suburb,
  active,
}: {
  suburb: NormalisedData<Suburb>;
  active: boolean;
}) => {
  const [ref, setRef] = useState<GeoJSONType>();

  if (active) {
    ref?.bindPopup(suburb.name);
    ref?.openPopup();
  }

  return (
    <GeoJSON
      data={suburb.boundary}
      style={{ color: colorSuburb(suburb.readingNormalised) }}
      onEachFeature={(feature, layer) => {
        layer.bindPopup(
          `${suburb.name}: ${suburb.reading && Math.round(suburb.reading)}`
        );
      }}
      ref={(r) => {
        if (r) {
          setRef(r);
        }
      }}
    ></GeoJSON>
  );
};

export const Map = ({
  suburbs,
  selectedSuburb,
  stations,
  trafficCounts,
}: {
  suburbs: NormalisedData<Suburb>[];
  selectedSuburb: number | undefined;
  stations?: { [key: string]: Station };
  trafficCounts?: NormalisedData<TrafficCount>[];
}) => {
  return (
    <MapContainer
      center={[-33.879, 151.1818]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {suburbs.map((suburb) => {
        const active = suburb.id === selectedSuburb;
        return Object.keys(suburb.boundary).map((suburbName, i) => {
          return (
            <GeoLayer
              suburb={suburb}
              key={`${suburbName},${i}`}
              active={active}
            />
          );
        });
      })}
      {stations &&
        trafficCounts &&
        trafficCounts.map((trafficCount) => {
          const station = stations[trafficCount.stationKey];
          if (!station || !trafficCount.readingNormalised) return;
          return (
            <Circle
              key={`count-${trafficCount.countId}`}
              center={[station.latitude, station.longitude]}
              radius={(trafficCount.readingNormalised * 1000) ^ 2}
              color="#000000"
              fillColor={colorSuburb(trafficCount.readingNormalised)}
              fillOpacity={1}
              weight={1}
            >
              <Popup>{`Count ${trafficCount.reading} \n Normalised ${
                trafficCount.readingNormalised
              } \n Color ${colorSuburb(
                trafficCount.readingNormalised
              )}`}</Popup>
            </Circle>
          );
        })}
    </MapContainer>
  );
};
