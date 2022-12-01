import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { DatewiseCategorySums } from "../../types/apiResponseTypes";
import { useEffect, useState } from "react";
import { Toggleable } from "../../types/form";
import styles from "./CategorySumsLineGraph.module.css";

Chart.register(...registerables);

type CategoryInput = Toggleable<{ category: string }>;

const CategoryToggles = ({
  categories,
  toggleCategory,
}: {
  categories: CategoryInput[];
  toggleCategory: (name: string) => void;
}) => {
  return (
    <div className={styles.CategoryToggleGroup}>
      {categories.map(({ category, on }) => (
        <div key={category}>
          <label>
            <input
              type="radio"
              checked={on}
              onChange={() => toggleCategory(category)}
            ></input>
            {category}
          </label>
        </div>
      ))}
    </div>
  );
};

export const CategorySumsLineGraph = ({
  dataSet1,
  dataSet2,
  label1,
  label2,
  labels,
}: {
  dataSet1: DatewiseCategorySums;
  dataSet2: DatewiseCategorySums;
  label1: string;
  label2: string;
  labels: string[];
}) => {
  const [categories1, setCategories1] = useState<CategoryInput[]>([]);
  const [categories2, setCategories2] = useState<CategoryInput[]>([]);

  // set up category toggles
  useEffect(() => {
    if (Object.keys(dataSet1).length === 0) return;
    if (Object.keys(dataSet2).length === 0) return;

    const getToggles = (dataSet: DatewiseCategorySums) => {
      const categories: { [key: string]: boolean } = { ALL: true };
      Object.keys(dataSet).forEach((date) => {
        Object.keys(dataSet[date]).map(
          (category) => (categories[category] = true)
        );
      });

      const inputToggles: CategoryInput[] = Object.keys(categories).map(
        (category) => ({
          category,
          on: category === "ALL" ? true : false,
        })
      );
      return inputToggles;
    };
    const categories1 = getToggles(dataSet1).sort();
    const categories2 = getToggles(dataSet2).sort();

    setCategories1(categories1);
    setCategories2(categories2);
  }, [dataSet1, dataSet2]);

  const toggleCategory1 = (categoryName: string) => {
    const updatedCategories = categories1.map(({ category }) => ({
      category,
      on: categoryName === category ? true : false,
    }));
    setCategories1(updatedCategories);
  };

  const toggleCategory2 = (categoryName: string) => {
    const updatedCategories = categories2.map(({ category }) => ({
      category,
      on: categoryName === category ? true : false,
    }));
    setCategories2(updatedCategories);
  };

  if (
    Object.keys(dataSet1).length === 0 ||
    Object.keys(dataSet2).length === 0
  ) {
    return <div>Click on a site to see readings</div>;
  }

  const getValues = (
    data: DatewiseCategorySums,
    categories: CategoryInput[],
    labels: string[]
  ) => {
    // const labels = Object.keys(data);
    const selectedCategory = categories.find(
      (category) => category.on
    )?.category;

    if (!selectedCategory) return [];
    if (selectedCategory === "ALL") {
      return labels.map((label) => {
        let value = 0;
        for (const category in data[label]) {
          value += data[label][category];
        }
        return value;
      });
    }
    return labels.map((label) => {
      return (data[label] && data[label][selectedCategory]) || 0;
    });
  };
  const values1 = getValues(dataSet1, categories1, labels);
  const values2 = getValues(dataSet2, categories2, labels);

  const chartOptions = {
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
      },
      y2: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
      },
    },
  };

  return (
    <div>
      <Line
        options={chartOptions}
        data={{
          labels: labels,
          datasets: [
            {
              data: values1,
              borderColor: "rgb(15, 192, 192)",
              tension: 0.5,
              label: label1,
              yAxisID: "y",
            },
            {
              data: values2,
              borderColor: "rgb(150, 10, 10)",
              tension: 0.5,
              label: label2,
              yAxisID: "y2",
            },
          ],
        }}
      ></Line>
      <div className={styles.CategoryToggles}>
        <CategoryToggles
          categories={categories1}
          toggleCategory={toggleCategory1}
        />
        <CategoryToggles
          categories={categories2}
          toggleCategory={toggleCategory2}
        />
      </div>
    </div>
  );
};
