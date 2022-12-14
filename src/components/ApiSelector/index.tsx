import { Apis } from "../../consts/SitesAndBoundaries";
import styles from "./ApiSelector.module.css";

type ApiSelectorParams = {
  apis: Apis;
  dataSource1: string;
  dataSource2: string;
  setDataSource1: React.Dispatch<React.SetStateAction<string>>;
  setDataSource2: React.Dispatch<React.SetStateAction<string>>;
};

export const ApiSelector = ({
  apis,
  dataSource1,
  dataSource2,
  setDataSource1,
  setDataSource2,
}: ApiSelectorParams) => {
  const apiKeys = Object.keys(apis);
  return (
    <div className={styles.ApiSelector}>
      <select
        name="apiSelector"
        id="apiSelector"
        onChange={(e) => setDataSource1(e.target.value)}
        defaultValue={dataSource1}
      >
        {apiKeys.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </select>
      <select
        name="apiSelector"
        id="apiSelector"
        onChange={(e) => setDataSource2(e.target.value)}
        defaultValue={dataSource2}
      >
        {apiKeys.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};
