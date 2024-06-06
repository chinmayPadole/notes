import React, { createContext, useContext, useState } from "react";

const SecurityContext = createContext({
  isLocked: false,
  toggleLock: (lock: boolean) => {},
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }: any) => {
  const [isLocked, toggleLock] = useState<boolean>(true);

  return (
    <SecurityContext.Provider value={{ isLocked, toggleLock }}>
      {children}
    </SecurityContext.Provider>
  );
};
