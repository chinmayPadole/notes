import { NoteProps } from "../components/note/NoteProps";

export const searchAndSort = (
  dataArray: NoteProps[],
  searchText: string
): NoteProps[] => {
  if (searchText.trim() === "") {
    return dataArray;
  }
  // Filter the objects that contain the searchText in their content
  const filteredArray = dataArray.filter((obj) =>
    obj.content.toLowerCase().includes(searchText.toLowerCase())
  );

  // Sort the filtered array based on the position of the searchText in the content
  filteredArray.sort((a, b) => {
    const posA = a.content.toLowerCase().indexOf(searchText.toLowerCase());
    const posB = b.content.toLowerCase().indexOf(searchText.toLowerCase());

    // If the position is the same, sort by the string comparison
    if (posA === posB) {
      return a.content.localeCompare(b.content);
    }

    // Otherwise, sort by the position
    return posA - posB;
  });

  return filteredArray;
};
