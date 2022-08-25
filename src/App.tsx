import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Map } from "./pages/Map";
import { Categories } from "./pages/Categories";
import { Yearly } from "./pages/Yearly";
import { getCategories } from "./requests/categories";
import { getSuburbs } from "./requests/suburbs";
import { getYears } from "./requests/emissions";
import { SuburbsIndexed, Category } from "./types";
import "./App.css";

function App() {
  const [suburbs, setSuburbs] = useState<SuburbsIndexed>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<number[]>([]);

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
