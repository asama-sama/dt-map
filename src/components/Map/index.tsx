import { MapContainer, TileLayer, Popup, GeoJSON } from "react-leaflet";
import {
  SuburbAggregateEmissionRanged,
  SuburbAggregateEmission,
  GeoJson,
} from "../../types";
import Color from "colorjs.io";

interface SuburbsCombined extends SuburbAggregateEmissionRanged {
  geojson: GeoJson;
}

export const Map = ({
  suburbs,
}: {
  suburbs: SuburbAggregateEmissionRanged[];
}) => {
  const suburbsAggregateEmissionsCombined: SuburbsCombined[] = [];
  suburbs.forEach((suburb) => {
    // combine suburbs with multiple polygons
    let coordinatesCombined: number[][][] = [];
    Object.keys(suburb.geoData).forEach((suburbKey) => {
      if (coordinatesCombined.length === 0) {
        coordinatesCombined = suburb.geoData[suburbKey].geojson.coordinates;
      } else {
        coordinatesCombined = coordinatesCombined.concat(
          suburb.geoData[suburbKey].geojson.coordinates
        );
      }
    });
    suburbsAggregateEmissionsCombined.push({
      ...suburb,
      geojson: {
        type: "Polygon",
        coordinates: coordinatesCombined,
      },
    });
  });
  const color = new Color("p3", [0, 1, 0]);
  const redgreen = color.range("red", {
    space: "lch", // interpolation space
    outputSpace: "srgb",
  });
  return (
    <MapContainer
      center={[-33.879, 151.1818]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {suburbsAggregateEmissionsCombined.map((suburb, i) => {
        return (
          <GeoJSON
            data={suburb.geojson}
            key={`suburb-${i}`}
            style={{ color: redgreen(suburb.readingRanged) }}
          >
            <Popup>
              <div>
                <b>{suburb.name}</b>
                <div>{suburb.reading}</div>
              </div>
            </Popup>
          </GeoJSON>
        );
      })}
    </MapContainer>
  );
};
