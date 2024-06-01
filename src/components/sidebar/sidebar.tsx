import React, { useState } from "react";
import "./sidebar.css";

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="content">
        {/* Your sidebar content goes here */}
        <p>Sidebar content...</p>
      </div>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isExpanded ? (
          <svg
            data-icon-name="menu-close"
            fill="currentColor"
            fill-rule="evenodd"
            height="32px"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            stroke="none"
            stroke-width="1"
            viewBox="0 0 24 24"
            width="32px"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path d="M26.935,21.467H14.452a1,1,0,1,0,0,2H26.935a1,1,0,1,0,0-2Zm0-6.467H14.452a1,1,0,1,0,0,2H26.935a1,1,0,1,0,0-2ZM14.452,10.533H26.935a1,1,0,0,0,0-2H14.452a1,1,0,0,0,0,2Zm-4.713.792a1,1,0,0,0-1.414,0L4.358,15.293a1,1,0,0,0,0,1.414l3.967,3.968a1,1,0,0,0,1.414-1.414L6.479,16l3.26-3.261A1,1,0,0,0,9.739,11.325Z"></path>
            </svg>
          </svg>
        ) : (
          <svg
            data-icon-name="menu-open"
            fill="currentColor"
            fill-rule="evenodd"
            height="32px"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            stroke="none"
            stroke-width="1"
            viewBox="0 0 24 24"
            width="32px"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path d="M17.548,8.533H5.065a1,1,0,1,0,0,2H17.548a1,1,0,0,0,0-2Zm0,6.467H5.065a1,1,0,0,0,0,2H17.548a1,1,0,1,0,0-2Zm0,6.467H5.065a1,1,0,0,0,0,2H17.548a1,1,0,1,0,0-2Zm10.094-6.174-3.968-3.968a1,1,0,1,0-1.414,1.414L25.521,16,22.26,19.261a1,1,0,1,0,1.414,1.414l3.968-3.968A1,1,0,0,0,27.642,15.293Z"></path>
            </svg>
          </svg>
        )}
      </button>
    </div>
  );
};
