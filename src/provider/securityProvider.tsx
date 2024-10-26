import React, { createContext, useContext, useEffect, useState } from "react";

const SecurityContext = createContext({
  isPageLocked: false,
  toggleLock: (lock: boolean) => {},
  isSessionUnlocked: false,
  toggleSessionUnlock: (unlock: boolean) => {},
  openLockPinModal: false,
  toggleLockPinModal: (open: boolean) => {},
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }: any) => {
  const [isPageLocked, setIsLocked] = useState<boolean>(false);
  const [isSessionUnlocked, setSessionLockingStatus] = useState<boolean>(false);
  const [openLockPinModal, toggleLockPinModal] = useState<boolean>(false);

  useEffect(() => {
    const isLockedAlready = localStorage.getItem("isLocked");
    if (isLockedAlready && isLockedAlready === "true") {
      setIsLocked(true);
    }

    const isPinEntered = window.sessionStorage.getItem("isSessionUnlocked");
    if (isPinEntered && isPinEntered === "true") {
      setSessionLockingStatus(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isLocked", isPageLocked ? "true" : "false");
  }, [isPageLocked]);

  const toggleLock = (lock: boolean) => {
    setIsLocked(lock);
  };

  const toggleSessionUnlock = (unlock: boolean) => {
    setSessionLockingStatus(unlock);
    window.sessionStorage.setItem(
      "isSessionUnlocked",
      unlock ? "true" : "false"
    );
  };

  return (
    <SecurityContext.Provider
      value={{
        isPageLocked,
        toggleLock,
        isSessionUnlocked,
        toggleSessionUnlock,
        openLockPinModal,
        toggleLockPinModal,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};
