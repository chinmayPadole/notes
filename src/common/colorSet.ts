export const ColorSet: {
  [key: string]: {
    noteHeader: string;
    fontColor: string;
    noteBackground: string;
    noteFooter: string;
    actionButtonColor: string;
    actionButtonHoverColor: string;
    footerActionColor: string;
  };
} = {
  black: {
    noteHeader: "radial-gradient(circle, #0e0e0e 15%, #010101)",
    noteFooter: "#000",
    fontColor: "#cccccc",
    noteBackground: "#2d2d2d",
    actionButtonColor: "#eeff00",
    actionButtonHoverColor: "#1c1c1c",
    footerActionColor: "wheat",
  },
  white: {
    noteHeader: "radial-gradient(circle, #e0e0e0 15%, #ededed)",
    noteFooter: "#cecece",
    fontColor: "#000000",
    noteBackground: "#ffffff",
    actionButtonColor: "#7b7777",
    actionButtonHoverColor: "#c9c9c9",
    footerActionColor: "#000",
  },
};
