import { GeoJSON as GeoJSONType } from "leaflet";
import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { SuburbWithData } from "../../types";
import { colorSuburb } from "../../util/colorSuburb";

const GeoLayer = ({
  suburb,
  suburbName,
  active,
}: {
  suburb: SuburbWithData;
  suburbName: string;
  active: boolean;
}) => {
  const [ref, setRef] = useState<GeoJSONType>();

  if (active) {
    ref?.bindPopup(`${suburb.reading?.toFixed(2)}`);
    ref?.openPopup();
  }

  return (
    <GeoJSON
      data={suburb.geoData[suburbName].geojson}
      style={{ color: colorSuburb(suburb.readingNormalised) }}
      onEachFeature={(feature, layer) => {
        const content = `<div>${suburb.name}: ${suburb.reading?.toFixed(
          2
        )}</div>`;
        layer.bindPopup(content);
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
}: {
  suburbs: SuburbWithData[];
  selectedSuburb: number | undefined;
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
        return Object.keys(suburb.geoData).map((suburbName, i) => {
          return (
            <GeoLayer
              suburb={suburb}
              suburbName={suburbName}
              key={`${suburbName},${i}`}
              active={active}
            />
          );
        });
      })}
    </MapContainer>
  );
};
