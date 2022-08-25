import { InputToggle } from "../../types";

export const Toggles = ({
  toggleInputs,
  setToggleInputs,
}: {
  toggleInputs: InputToggle[];
  setToggleInputs: React.Dispatch<React.SetStateAction<InputToggle[]>>;
}) => {
  return (
    <div>
      {toggleInputs.map((toggleInput, i) => (
        <div key={`toggle-${i}`} className="Selection">
          <label key={`cat-${i}`} htmlFor={`toggle-${i}`}>
            {toggleInput.name}
          </label>
          <input
            id={`toggle-${i}`}
            name={`toggle-${i}`}
            type="checkbox"
            value={toggleInput.id}
            checked={toggleInput.on}
            onChange={(e) => {
              const newCategoriesToggles = toggleInputs.map(
                (toggleInput, j) => {
                  if (i === j) {
                    return {
                      ...toggleInput,
                      on: e.target.checked,
                    };
                  } else {
                    return toggleInput;
                  }
                }
              );
              setToggleInputs(newCategoriesToggles);
            }}
          ></input>
        </div>
      ))}
    </div>
  );
};
