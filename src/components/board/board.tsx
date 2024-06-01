import { Sidebar } from "../sidebar/sidebar";
import "./board.css"

export const Board = () => {
    return (
        <div id="boardBody">
            <div id="sidebar">
                <Sidebar />
            </div>
            <div id="board">board</div>
        </div>
    );
};
