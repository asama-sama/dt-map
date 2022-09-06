import "./RankingPanel.css";

type RankedList = {
  id: number;
  name: string;
  value: number;
};

type ColoringFunction = (number: number) => string;

type OnMouseEnterHandle = (id: number) => void;

export const RankingPanel = ({
  rankedList,
  coloring,
  onMouseEnter,
}: {
  rankedList: RankedList[];
  coloring: ColoringFunction;
  onMouseEnter: OnMouseEnterHandle;
}) => {
  const orderedRankedList = rankedList.sort(
    (item1, item2) => item2.value - item1.value
  );

  return (
    <div className="RankingPanel">
      <b>Ranking</b>
      {orderedRankedList.map((item, i) => {
        return (
          <div
            key={`rankedItem-${i}`}
            className={"Rank"}
            onMouseEnter={() => onMouseEnter(item.id)}
            style={{ color: coloring(item.value) }}
          >
            {i + 1}: <b>{item.name}</b>
          </div>
        );
      })}
    </div>
  );
};
