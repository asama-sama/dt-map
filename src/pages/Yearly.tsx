import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Color from "colorjs.io";
import { getYearlyEmissionsBySuburb } from "../requests/suburbs";
import {
  Emission,
  EmissionsBySuburb,
  SuburbsIndexed,
  Category,
  InputToggle,
} from "../types";
import { Toggles } from "../components/Toggles";
import "./Yearly.css";

type SortOptions = "high" | "low";
type SuburbColors = {
  [key: number]: {
    borderColor: string;
    backgroundColor: string;
  };
};

let suburbColors: SuburbColors = {};

export const Yearly = ({
  years,
  suburbs,
  categories,
}: {
  years: number[];
  suburbs: SuburbsIndexed;
  categories: Category[];
}) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const [emissionsBySuburb, setEmissionsBySuburb] = useState<EmissionsBySuburb>(
    []
  );
  const [sort, setSort] = useState<SortOptions>("high");
  const [categoryToggles, setCategoryToggles] = useState<InputToggle[]>([]);

  const sortOptions: SortOptions[] = ["high", "low"];

  const getSuburbColor = (suburbId: number) => {
    if (!suburbColors[suburbId]) {
      const rgb = [Math.random(), Math.random(), Math.random()];
      const backgroundColor = new Color("sRGB", rgb, 0.2);
      const borderColor = new Color("sRGB", rgb);
      const suburbColor = {
        backgroundColor,
        borderColor,
      };
      suburbColors = {
        ...suburbColors,
        [suburbId]: suburbColor,
      };
      return suburbColor;
    } else {
      return suburbColors[suburbId];
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const results = await getYearlyEmissionsBySuburb(
        categoryToggles.filter((toggle) => toggle.on).map((toggle) => toggle.id)
      );
      setEmissionsBySuburb(results);
    };
    fetch();
  }, [categoryToggles]);

  useEffect(() => {
    const categoryToggles = categories.map((category) => ({
      id: category.id,
      name: category.name,
      on: true,
    }));
    setCategoryToggles(categoryToggles);
  }, [categories]);

  const labels = years;

  type SuburbGrowth = {
    suburbId: number;
    growth: number;
  };

  const suburbGrowth: SuburbGrowth[] = [];

  for (const suburbId in emissionsBySuburb) {
    const emissions = emissionsBySuburb[suburbId];
    emissions.sort((e1, e2) => e2.reading - e1.reading);
    const [max, min] = [
      emissions[0].reading,
      emissions[emissions.length - 1].reading,
    ];
    suburbGrowth.push({
      suburbId: parseInt(suburbId),
      growth: max - min,
    });
  }
  suburbGrowth.sort((sg1, sg2) => sg2.growth - sg1.growth);

  type Dataset = {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    hidden: boolean;
  };

  const datasets: Dataset[] = [];

  suburbGrowth.map((sg, i) => {
    const emissionYearMap: { [key: number]: Emission } = {};
    emissionsBySuburb[sg.suburbId].map(
      (emission) => (emissionYearMap[emission.year] = emission)
    );
    const data = years.map((year) => emissionYearMap[year].reading);

    let hidden;
    if (sort === "high") {
      hidden = i < 5 ? false : true;
    } else {
      hidden = suburbGrowth.length - 1 - i < 5 ? false : true;
    }

    const color = getSuburbColor(sg.suburbId);

    if (!suburbs[sg.suburbId]) return;
    const dataset = {
      label: suburbs[sg.suburbId].name,
      data,
      borderColor: color.borderColor,
      backgroundColor: color.backgroundColor,
      hidden,
    };
    datasets.push(dataset);
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    color: "white",
  };

  return (
    <div className="Yearly">
      <div className="YearlyContent">
        <h1>Yearly Emissions</h1>
        <h2>{sort === "high" ? "Highest" : "Lowest"} variation suburbs</h2>
        <div className="Content">
          <div className="MainContent">
            <Line options={options} data={data} />
          </div>
          <div className="SidePanel">
            <div>
              <h2>Variation</h2>
              {sortOptions.map((sortOption, i) => (
                <div key={`opt-${i}`}>
                  <label>
                    {sortOption}
                    <input
                      type="radio"
                      onChange={() => setSort(sortOption)}
                      checked={sortOption === sort ? true : false}
                    ></input>
                  </label>
                </div>
              ))}
            </div>
            <h2>Filter categories</h2>
            <Toggles
              toggleInputs={categoryToggles}
              setToggleInputs={setCategoryToggles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
