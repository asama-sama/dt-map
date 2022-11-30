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
      const categories: { [key: string]: boolean } = {};
      Object.keys(dataSet).forEach((date) => {
        Object.keys(dataSet[date]).map(
          (category) => (categories[category] = true)
        );
      });

      const inputToggles: CategoryInput[] = Object.keys(categories).map(
        (category) => ({
          category,
          on: false,
        })
      );
      return inputToggles;
    };
    const categories1 = getToggles(dataSet1);
    const categories2 = getToggles(dataSet2);

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

  const getLabelsAndValues = (
    data: DatewiseCategorySums,
    categories: CategoryInput[]
  ) => {
    const labels = Object.keys(data);
    const values = Object.keys(data).map((date) => {
      const selectedCategory = categories.find(
        (category) => category.on
      )?.category;
      if (!selectedCategory) return 0;
      return data[date][selectedCategory];
    });
    return { labels, values };
  };
  const { labels: labels1, values: values1 } = getLabelsAndValues(
    dataSet1,
    categories1
  );
  const { values: values2 } = getLabelsAndValues(dataSet2, categories2);
  console.log(values2);

  return (
    <div>
      <Line
        data={{
          labels: labels,
          datasets: [
            // {
            //   data: values1,
            //   borderColor: "rgb(15, 192, 192)",
            //   tension: 0.5,
            //   label: label1,
            // },
            {
              data: values2,
              borderColor: "rgb(150, 10, 10)",
              tension: 0.5,
              label: label2,
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
