import { NoteProps } from "../components/note/NoteProps";

export const manageNotesSync = (incomingData: string) => {
  const incomingNotes: NoteProps[] = JSON.parse(incomingData);

  const internaNotes: NoteProps[] = JSON.parse(
    localStorage.getItem("notes") || "[]"
  );

  const newNotes = mergeArrays(internaNotes, incomingNotes);
  localStorage.setItem("notes", JSON.stringify(newNotes));
};

const mergeArrays = (arrayA: NoteProps[], arrayB: NoteProps[]): NoteProps[] => {
  // Create a map to store objects by their IDs
  const map = new Map();

  // Add all objects from arrayA to the map
  arrayA.forEach((item) => map.set(item.id, item));

  // Add all objects from arrayB to the map, overriding duplicates from arrayA
  arrayB.forEach((item) => map.set(item.id, item));

  // Convert the map values back to an array
  return Array.from(map.values());
};
