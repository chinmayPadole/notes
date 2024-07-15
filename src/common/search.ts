import { NoteProps } from "../components/note/NoteProps";

export const searchAndSort = (
  dataArray: NoteProps[],
  searchText: string
): NoteProps[] => {
  if (searchText.trim() === "") {
    return dataArray;
  }

  // Normalize searchText for case-insensitive comparison
  const normalizedSearchText = searchText.toLowerCase();

  // Filter the objects that contain the searchText in their content
  const filteredArray = dataArray.filter((obj) => {
    const contentMatch = obj.content
      .toLowerCase()
      .includes(normalizedSearchText);
    const titleMatch = obj.title
      ? obj.title.toLowerCase().includes(normalizedSearchText)
      : false;
    return contentMatch || titleMatch;
  });

  // Sort the filtered array based on the position of the searchText in the content
  filteredArray.sort((a, b) => {
    const posAContent = a.content.toLowerCase().indexOf(normalizedSearchText);
    const posBContent = b.content.toLowerCase().indexOf(normalizedSearchText);

    const posATitle = a.title
      ? a.title.toLowerCase().indexOf(normalizedSearchText)
      : -1;
    const posBTitle = b.title
      ? b.title.toLowerCase().indexOf(normalizedSearchText)
      : -1;

    const posA = posATitle !== -1 ? posATitle : posAContent;
    const posB = posBTitle !== -1 ? posBTitle : posBContent;

    // If the position is the same, sort by the string comparison of content or title
    if (posA === posB) {
      const aComparisonString = posATitle !== -1 ? a.title! : a.content;
      const bComparisonString = posBTitle !== -1 ? b.title! : b.content;
      return aComparisonString.localeCompare(bComparisonString);
    }

    // Otherwise, sort by the position
    return posA - posB;
  });

  return filteredArray;
};
