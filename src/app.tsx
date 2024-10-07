import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Root } from "./root";
import { ShareTargetHandler } from "./components/shareTarget/shareTargetHandler";

const App: React.FC = () => {
  const addNote = (note: string) => {
    // Save the note to localStorage or IndexedDB (you can use the earlier implementation)
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    storedNotes.push(note);
    localStorage.setItem("notes", JSON.stringify(storedNotes));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route
          path="/share-target"
          element={<ShareTargetHandler addNote={addNote} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
