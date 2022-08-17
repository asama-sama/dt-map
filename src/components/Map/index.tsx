import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { Suburb, GeoJson } from "../../types";

export const Map = ({ suburbs }: { suburbs?: Suburb[] }) => {
  const suburbGeojson: GeoJson[] = [];
  suburbs &&
    suburbs.forEach((suburb) => {
      Object.keys(suburb.geoData).forEach((suburbKey) => {
        suburbGeojson.push(suburb.geoData[suburbKey].geojson);
      });
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
      <Marker position={[-33.879, 151.1818]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      {suburbGeojson &&
        suburbGeojson.map((suburb, i) => {
          return <GeoJSON data={suburb} key={`suburb-${i}`}></GeoJSON>;
        })}
    </MapContainer>
  );
};
