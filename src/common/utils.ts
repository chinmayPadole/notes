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

export const maskString = (
  input: string,
  showStart: number,
  showEnd: number,
  maskChar: string = "*"
): string => {
  const inputLength = input.length;

  // If the length of the string is 1 or if showStart + showEnd is greater than the string length,
  // mask the entire string.
  if (inputLength <= 1 || showStart + showEnd >= inputLength) {
    return maskChar.repeat(inputLength);
  }

  // Return the masked string by slicing the input string and concatenating the mask characters
  return (
    input.slice(0, showStart) +
    maskChar.repeat(inputLength - showStart - showEnd) +
    input.slice(inputLength - showEnd)
  );
};
