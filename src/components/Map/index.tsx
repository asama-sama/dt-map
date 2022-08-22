import Color from "colorjs.io";
import { MapContainer, TileLayer, Popup, GeoJSON } from "react-leaflet";
import { SuburbWithData } from "../../types";

export const Map = ({ suburbs }: { suburbs: SuburbWithData[] }) => {
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
        return Object.keys(suburb.geoData).map((suburbName, i) => {
          return (
            <GeoJSON
              data={suburb.geoData[suburbName].geojson}
              key={`suburb-${suburb.id}-${i}`}
              style={{ color: redgreen(suburb.readingNormalised) }}
            >
              <Popup>
                <div>
                  <b>
                    {suburb.id}: {suburb.name}
                  </b>
                  <div>{suburb.reading}</div>
                </div>
              </Popup>
            </GeoJSON>
          );
        });
      })}
    </MapContainer>
  );
};
