import React, { createContext, useContext, useEffect, useState } from "react";

const SecurityContext = createContext({
  isLocked: false,
  toggleLock: (lock: boolean) => {},
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }: any) => {
  const [isLocked, toggleLock] = useState<boolean>(false);

  const authenticate = async () => {
    try {
      const credentials = await navigator.credentials.get({
        //password: true, // Include this for fingerprint or other biometric authentication
        mediation: "silent", // Specify 'silent' to prevent UI prompts
      });

      if (credentials != null) {
        console.log("PASS");
        // Successfully authenticated with biometric credentials
        toggleLock(true);
      } else {
        console.log("FAIL");
        // Biometric authentication failed or user canceled
        toggleLock(false);
      }
    } catch (error) {
      // Handle errors
      console.error(error);
      toggleLock(false);
    }
  };

  useEffect(() => {
    authenticate();
  });

  return (
    <SecurityContext.Provider value={{ isLocked, toggleLock }}>
      {children}
    </SecurityContext.Provider>
  );
};
