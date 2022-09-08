import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Map } from "./pages/Map";
import { MapAirQuality } from "./pages/MapAirQuality";
import { MapLive } from "./pages/MapLive";
import { Categories } from "./pages/Categories";
import { Yearly } from "./pages/Yearly";
import { getCategories } from "./requests/categories";
import { getSuburbs } from "./requests/suburbs";
import { getYears } from "./requests/emissions";
import { SuburbsIndexed, Category, Api } from "./types";
import "./App.css";
import { getApis } from "./requests/apis";

function App() {
  const [suburbs, setSuburbs] = useState<SuburbsIndexed>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [apis, setApis] = useState<Api[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const suburbs = await getSuburbs();
        const suburbsMap: SuburbsIndexed = {};
        suburbs.map((suburb) => (suburbsMap[suburb.id] = suburb));
        setSuburbs(suburbsMap);
        const categories = await getCategories();
        setCategories(categories);
        const years = await getYears();
        setYears(years);
        const apis = await getApis();
        setApis(apis);
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <div className="App">
      <nav className="Routes">
        <Link to="/">Map</Link>
        <Link to="/airquality">Air Quality Map</Link>
        <Link to="/live">Live Map</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/yearly">Yearly</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <Map suburbs={suburbs} categories={categories} years={years} />
          }
        />
        <Route
          path="/airquality"
          element={<MapAirQuality suburbs={suburbs} apis={apis} />}
        />
        <Route
          path="/live"
          element={<MapLive suburbs={suburbs} apis={apis} />}
        />
        <Route
          path="/categories"
          element={<Categories categories={categories} />}
        />
        <Route
          path="/yearly"
          element={
            <Yearly years={years} suburbs={suburbs} categories={categories} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
