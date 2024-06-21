import { createContext, useEffect } from "react";

import { getUniqueId } from "../common/utils";

const CoreContext = createContext({});

export const CoreProvider = ({ children }: any) => {
  useEffect(() => {
    const app_id = localStorage.getItem("app_id");
    if (app_id === null || app_id === undefined || app_id.trim() === "") {
      localStorage.setItem("app_id", getUniqueId());
    }
  }, []);

  return <CoreContext.Provider value={{}}>{children}</CoreContext.Provider>;
};
