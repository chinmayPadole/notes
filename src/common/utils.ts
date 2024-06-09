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
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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

export const isValidImage = (str: string): boolean => {
  const imagePrefixPattern = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,/;
  // Check if it's a valid Base64 string
  const bas64String = str.replace(imagePrefixPattern, "");
  const base64Pattern =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Pattern.test(bas64String)) {
    return false;
  }

  // Check if it has a valid image prefix

  return imagePrefixPattern.test(str);
};

export const blobToBase64 = (url: string) => {
  return new Promise(async (resolve, _) => {
    // do a request to the blob uri
    const response = await fetch(url);

    // response has a method called .blob() to get the blob file
    const blob = await response.blob();

    // instantiate a file reader
    const fileReader = new FileReader();

    // read the file
    fileReader.readAsDataURL(blob);

    fileReader.onloadend = function () {
      resolve(fileReader.result); // Here is the base64 string
    };
  });
};

export const isMobile = () => {
  const userAgent: string = navigator.userAgent || (navigator as any).vendor;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
};
