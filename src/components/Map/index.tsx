import Color from "colorjs.io";
import { GeoJSON as GeoJSONType } from "leaflet";
import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { SuburbWithData } from "../../types";

type ColoringProps = (number: number | undefined) => string;

const GeoLayer = ({
  suburb,
  suburbName,
  coloring,
  active,
}: {
  suburb: SuburbWithData;
  suburbName: string;
  coloring: ColoringProps;
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
      style={{ color: coloring(suburb.readingNormalised) }}
      onEachFeature={(feature, layer) => {
        const content = `<div>${suburb.reading}</div>`;
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
  const color = new Color("p3", [0, 1, 0]);
  const redgreen = color.range("red", {
    space: "lch", // interpolation space
    outputSpace: "srgb",
  });
  const sortedSuburbs = suburbs.sort((s1, s2) => s1.id - s2.id); // always sort here so they get rendered in the same order
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
      {sortedSuburbs.map((suburb) => {
        const active = suburb.id === selectedSuburb;
        return Object.keys(suburb.geoData).map((suburbName, i) => {
          return (
            <GeoLayer
              suburb={suburb}
              suburbName={suburbName}
              coloring={redgreen}
              key={`${suburbName},${i}`}
              active={active}
            />
          );
        });
      })}
    </MapContainer>
  );
};
