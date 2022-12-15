import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Slider from "rc-slider";
import { DatewiseCategorySums } from "../../types/apiResponseTypes";
import { useEffect, useMemo, useState } from "react";
import { Toggleable } from "../../types/form";
import styles from "./CategorySumsLineGraph.module.css";
import { DateRange, TemporalAggregate } from "../../types";
import { Marks, SliderProps } from "../../types/rc-slider";
import { State } from "@hookstate/core";

Chart.register(...registerables);

type CategoryInput = Toggleable<{ category: string }>;

const getValues = (
  data: DatewiseCategorySums,
  categories: CategoryInput[],
  labels: string[]
) => {
  const selectedCategory = categories.find((category) => category.on)?.category;

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

const CategoryToggles = ({
  categories,
  toggleCategory,
  row,
  className,
}: {
  categories: CategoryInput[];
  toggleCategory: (name: string) => void;
  row?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`${styles.CategoryToggleGroup} ${
        row && styles.CategoryToggleGroupRow
      } ${className}`}
    >
      {categories.map(({ category, on }) => (
        <div className={styles.CategoryToggle} key={category}>
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
  graphLabels,
  sliderLabels,
  aggregation,
  setAggregation,
  selectedDateRangeState,
}: {
  dataSet1: DatewiseCategorySums;
  dataSet2: DatewiseCategorySums;
  label1: string;
  label2: string;
  graphLabels: string[];
  sliderLabels: string[];
  aggregation: TemporalAggregate;
  setAggregation: (aggregate: TemporalAggregate) => void;
  selectedDateRangeState: State<DateRange>;
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

    const sortCategories = (a: CategoryInput, b: CategoryInput) => {
      if (a.category === "ALL") return -1;
      if (b.category === "ALL") return 1;
      return a.category.localeCompare(b.category);
    };

    const categories1 = getToggles(dataSet1).sort(sortCategories);
    const categories2 = getToggles(dataSet2).sort(sortCategories);

    setCategories1(categories1);
    setCategories2(categories2);
  }, [dataSet1, dataSet2]);

  const defaultSliderValues: [number, number] = useMemo(() => {
    const { startDate: _startDate, endDate: _endDate } =
      selectedDateRangeState.get();
    const startDate = new Date(_startDate);
    const endDate = new Date(_endDate);
    let startDateIdx: number | undefined = undefined,
      endDateIdx: number | undefined = undefined;
    sliderLabels.forEach((label, idx) => {
      const current = new Date(label);
      if (!startDateIdx && startDate <= current) {
        startDateIdx = idx;
      }
      if (!endDateIdx && endDate <= current) {
        endDateIdx = idx;
      }
    });
    return [startDateIdx || 0, endDateIdx || sliderLabels.length - 1];
  }, []);

  const sliderProps = useMemo(() => {
    const MAX_LABELS = 5;
    const step = sliderLabels.length / (MAX_LABELS + 1);
    const steps = Array.from({ length: MAX_LABELS }).map((i, idx) => {
      return (idx + 1) * step;
    });
    const marks: Marks = {};
    marks[0] = { label: sliderLabels[0] };
    sliderLabels.map((label, idx) => {
      if (idx > steps[0]) {
        marks[idx] = { label };
        steps.shift();
      }
    });
    marks[sliderLabels.length - 1] = {
      label: sliderLabels[sliderLabels.length - 1],
    };
    const sliderProps: SliderProps = {
      min: 0,
      max: sliderLabels.length - 1,
      marks,
      defaultValue: defaultSliderValues,
    };
    return sliderProps;
  }, [sliderLabels]);

  if (
    Object.keys(dataSet1).length === 0 ||
    Object.keys(dataSet2).length === 0
  ) {
    return <div>Select sites and suburbs to see readings</div>;
  }

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

  const values1 = getValues(dataSet1, categories1, graphLabels);
  const values2 = getValues(dataSet2, categories2, graphLabels);

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

  const aggregationToggles = ["day", "month", "year"].map((str) => ({
    category: str,
    on: str === aggregation ? true : false,
  }));

  const onSliderChange = (sliderValue: number | number[]) => {
    if (typeof sliderValue === "number") return;
    const [start, end] = sliderValue;
    const startDate = sliderLabels[start];
    const endDate = sliderLabels[end];
    selectedDateRangeState.set({
      startDate,
      endDate,
    });
  };

  return (
    <div className={styles.CategorySumsLineGraph}>
      <div className={styles.Linebreak}></div>
      <h3>Readings</h3>
      <Line
        options={chartOptions}
        data={{
          labels: graphLabels,
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
      <div className={styles.Linebreak}></div>
      <h3>Categories</h3>
      <div className={styles.CategoryToggles}>
        <div className={styles.CategoryTogglePane}>
          <p className={`${styles.CategoryToggleLabel} `}>{label1}</p>
          <CategoryToggles
            categories={categories1}
            toggleCategory={toggleCategory1}
          />
        </div>
        <div className={styles.VerticalLine}>
          <div></div>
        </div>
        <div className={styles.CategoryTogglePane}>
          <p className={styles.CategoryToggleLabel}>{label2}</p>
          <CategoryToggles
            categories={categories2}
            toggleCategory={toggleCategory2}
          />
        </div>
      </div>
      <div className={styles.Linebreak}></div>
      <h3>Aggregation</h3>
      <div className={styles.CenterChildren}>
        <CategoryToggles
          row={true}
          categories={aggregationToggles}
          toggleCategory={(cat) => {
            if (cat !== "day" && cat !== "month" && cat !== "year") return;
            setAggregation(cat);
          }}
        ></CategoryToggles>
      </div>
      <div className={styles.Linebreak}></div>
      <h3>Date Range</h3>
      <div className={styles.dateSliderContainer}>
        <Slider {...sliderProps} range onAfterChange={onSliderChange} />
      </div>
    </div>
  );
};
