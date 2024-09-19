import "./root.css";

import { SuperNotes } from "./components/superNotes/superNotes";
import { WhatsYourName } from "./components/whatsyourname/whatsyourname";
import { useEffect, useState } from "react";
import { SplashScreen } from "./components/splashScreen/splashScreen";

export const Root = () => {
  const [isNotesVisible, setNotesVisible] = useState<boolean>(false);

  const [isMainVisible, setMainVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isMainVisible) {
      const timer = setTimeout(() => {
        setMainVisible(false);
        setNotesVisible(true);
      }, 2500);

      // Cleanup timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, [isMainVisible]);

  return (
    <>
      <WhatsYourName setMainVisible={setMainVisible} />
      {isMainVisible && <SplashScreen />}
      {isNotesVisible && <SuperNotes />}
    </>
  );
};
