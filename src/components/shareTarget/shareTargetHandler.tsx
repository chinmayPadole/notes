import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ShareTargetHandler: React.FC<{
  addNote: (note: string) => void;
}> = ({ addNote }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the data from the URL's search params (for GET) or form data (for POST)
    const searchParams = new URLSearchParams(location.search);
    const title = searchParams.get("name");
    const text = searchParams.get("description");

    console.log(title, text);
    if (text) {
      // Save the shared text as a new note
      addNote(text);

      // Optionally, navigate back to home or show a confirmation screen
      navigate("/");
    }
  }, [location, addNote, navigate]);

  return (
    <div>
      <h1>Processing shared note...</h1>
    </div>
  );
};
