import "./settings.css";

interface SettingsProps {
  isLocked: boolean;
  setLock: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Settings: React.FC<SettingsProps> = ({ isLocked, setLock }) => {
  const toggleLock = () => {
    setLock(!isLocked);
  };

  return (
    <header className="header">
      <h1 className="title">macOS Themed Header</h1>
      <button
        className={`lock-button ${isLocked ? "locked" : "unlocked"}`}
        onClick={toggleLock}
      >
        {isLocked ? "🔒" : "🔓"}
      </button>
    </header>
  );
};
