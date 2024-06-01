import { Board } from "./components/board/board";
import { Settings } from "./components/settings/settings";
import "./root.css";

export const Root = () => {
    return (
        <div className="root">
            <div className="settings">
                <Settings />
            </div>
            <div className="board">
                <Board />
            </div>
        </div>
    );
};
