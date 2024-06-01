export const getFormattedDate = (
  date: Date,
  culture: string = "en-US"
): string => {
  const retDate = new Date(date);

  return Intl.DateTimeFormat(culture, {
    weekday: "short",
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(retDate);
};

export const getUniqueId = () => {
  const timestamp: number = new Date().getTime();
  const randomString: string = Math.random().toString(36).substr(2, 8); // Generate a random string with 8 characters

  return `${timestamp}-${randomString}`;
};
