import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Map } from "./pages/Map";
import { Categories } from "./pages/Categories";
import { getCategories } from "./requests/categories";
import { getSuburbs } from "./requests/suburbs";
import { SuburbsIndexed, Category } from "./types";
import "./App.css";

function App() {
  const [suburbs, setSuburbs] = useState<SuburbsIndexed>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const suburbs = await getSuburbs();
        const suburbsMap: SuburbsIndexed = {};
        suburbs.map((suburb) => (suburbsMap[suburb.id] = suburb));
        setSuburbs(suburbsMap);
        const categories = await getCategories();
        setCategories(categories);
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
      </nav>
      <Routes>
        <Route
          path="/"
          element={<Map suburbs={suburbs} categories={categories} />}
        />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </div>
  );
}

export default App;
