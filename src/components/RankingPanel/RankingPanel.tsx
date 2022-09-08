import "./RankingPanel.css";

type RankedList = {
  id: number;
  name: string;
  value: number | null;
};

type ColoringFunction = (number: number | null) => string;

type OnMouseEnterHandle = (id: number | undefined) => void;

export const RankingPanel = ({
  rankedList,
  coloring,
  onMouseEnter,
}: {
  rankedList: RankedList[];
  coloring: ColoringFunction;
  onMouseEnter: OnMouseEnterHandle;
}) => {
  const orderedRankedList = rankedList.sort((item1, item2) => {
    if (item1.value === null) return 1;
    if (item2.value === null) return -1;
    return item2.value - item1.value;
  });

  return (
    <div className="RankingPanel">
      <b>Ranking</b>
      {orderedRankedList.map((item, i) => {
        return (
          <div
            key={`rankedItem-${i}`}
            className={"Rank"}
            onMouseEnter={() => onMouseEnter(item.id)}
            onMouseLeave={() => onMouseEnter(undefined)}
            style={{ color: coloring(item.value) }}
          >
            {i + 1}: <b>{item.name}</b>
          </div>
        );
      })}
    </div>
  );
};
