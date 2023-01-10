import Color from "colorjs.io";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { getEmissionsByCategory } from "../requests/categories";
import { Emission } from "../types";
import "./Categories.css";

type Category = {
  id: number;
  name: string;
};

ChartJS.register(ArcElement, Tooltip, Legend);

const getRandomColor = () => {
  const rgb = [Math.random(), Math.random(), Math.random()];

  const background = new Color("sRGB", rgb, 0.2);
  const border = new Color("sRGB", rgb, 1);
  return {
    background,
    border,
  };
};

interface EmissionWithCategory extends Emission {
  category?: Category;
}

export const Categories = ({ categories }: { categories: Category[] }) => {
  const [emissionsWithCategory, setEmissionsWithCategory] = useState<
    EmissionWithCategory[]
  >([]);

  useEffect(() => {
    const fetch = async () => {
      const emissions = await getEmissionsByCategory();
      const emissionsWithCategory: EmissionWithCategory[] = emissions.map(
        (emission) => ({
          ...emission,
          category: categories.find(
            (category) => category.id === emission.categoryId
          ),
        })
      );
      setEmissionsWithCategory(emissionsWithCategory);
    };
    fetch();
  }, [categories]);

  const labels = emissionsWithCategory.map(
    (emission) => emission.category?.name
  );
  const colors = emissionsWithCategory.map(() => getRandomColor());

  const datasets = [
    {
      label: "test",
      data: emissionsWithCategory.map((emission) => emission.reading),
      backgroundColor: colors.map((color) => color.background),
      hoverBackgroundColor: colors.map((color) => color.background),
      borderColor: colors.map((color) => color.border),
      hoverBorderColor: colors.map((color) => color.border),
      borderWidth: 1,
    },
  ];

  const data = {
    labels,
    datasets,
  };

  const emissionsRanked = emissionsWithCategory.concat();
  emissionsRanked.sort((e1, e2) => e2.reading - e1.reading);

  return (
    <div className="Categories">
      <h1>Emissions By Category</h1>
      <div className="Doughnut">
        <Doughnut data={data} options={{ color: "white" }} />
        <div className="CategoryRanks">
          <h2>Ranks</h2>
          {emissionsRanked.map((emission, i) => (
            <div
              className="CategoryRank"
              key={`emission-${i}`}
              style={{ color: colors[i].border }}
            >
              <span>{emission.category?.name}</span>
              <span>
                <b>{emission.reading.toFixed(2)}</b>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
