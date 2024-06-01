import { useState } from "react";
import { Board } from "./components/board/board";
import { Settings } from "./components/settings/settings";
import "./root.css";

export const Root = () => {
  const [locked, setLock] = useState(true);

  return (
    <div className="root">
      <div className="settings">
        <Settings isLocked={locked} setLock={setLock} />
      </div>
      <div className="board">
        <Board />
      </div>
    </div>
  );
};
