import "./root.css";

import { SuperNotes } from "./components/superNotes/superNotes";
import { WhatsYourName } from "./components/whatsyourname/whatsyourname";
import { useEffect, useState } from "react";
import { SplashScreen } from "./components/splashScreen/splashScreen";
import { getData, initDB, Stores } from "./db/IndexedDBManager";

export const Root = () => {
  const [isNotesVisible, setNotesVisible] = useState<boolean>(false);

  const [isMainVisible, setMainVisible] = useState<boolean>(false);
  const [overrideSplashScreenVisibility, setOverrideSplashScreenVisibility] =
    useState<boolean>(false);

  useEffect(() => {
    handleLaunch();
  }, []);

  const handleLaunch = async () => {
    initDB().then(async (result) => {
      //console.log(result);
      if (result) {
        const userNameData = (await getData(Stores.Username)) as any;
        //console.log(userNameData);
        if (
          userNameData.length === 0 ||
          userNameData[0].value === undefined ||
          userNameData[0].value.username.trim() === ""
        ) {
          setOverrideSplashScreenVisibility(true);
        } else {
          setNotesVisible(true);
        }
      }
    });
  };

  useEffect(() => {
    if (isMainVisible && overrideSplashScreenVisibility) {
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
      {overrideSplashScreenVisibility && isMainVisible && <SplashScreen />}
      {isNotesVisible && <SuperNotes />}
    </>
  );
};
