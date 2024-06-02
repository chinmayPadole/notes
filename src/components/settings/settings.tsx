import { useSecurity } from "../../provider/securityProvider";
import "./settings.css";

export const Settings: React.FC = () => {
  const { isLocked, toggleLock } = useSecurity();
  const lock = () => {
    toggleLock(!isLocked);
  };

  return (
    <header className="header">
      <h1 className="title">Header</h1>
      <button
        className={`lock-button ${isLocked ? "locked" : "unlocked"}`}
        onClick={lock}
      >
        {isLocked ? "🔒" : "🔓"}
      </button>
    </header>
  );
};
