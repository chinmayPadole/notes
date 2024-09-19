//let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 2;

export enum Stores {
  Reminders = "reminders",
  Username = "username",
}

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // open the connection
    const request = indexedDB.open("supernotes");

    request.onupgradeneeded = () => {
      db = request.result;

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains(Stores.Reminders)) {
        db.createObjectStore(Stores.Reminders, { autoIncrement: true });
      }
      //console.log("request.onupgradeneeded - initDB", version);
      if (!db.objectStoreNames.contains(Stores.Username)) {
        db.createObjectStore(Stores.Username, { autoIncrement: true });
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      db = request.result;
      version = db.version;
      //console.log("request.onsuccess - initDB", version);
      resolve(true);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export const addData = <T>(
  storeName: string,
  data: T
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    const request = indexedDB.open("supernotes", version);

    request.onsuccess = () => {
      //console.log("request.onsuccess - addData", data);
      db = request.result;
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      //console.log(data);
      store.add({ value: data });

      // const hack: any = data;
      // hack.reminderDate = new Date(new Date().getTime() - 30 * 60000);
      // console.log(hack);
      // store.add({ value: hack });
      resolve(data);
    };

    request.onerror = () => {
      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve("Unknown error");
      }
    };
  });
};

export const getStoreData = <T>(storeName: Stores): Promise<T[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      //console.log("request.onsuccess - getAllData");
      db = request.result;
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};

export async function getData<T>(storeName: Stores): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      if (request.readyState === "done") {
        //console.log("request.onsuccess - getAllData");
        db = request.result;
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const res = store.getAll();
        res.onsuccess = () => {
          resolve(res.result);
        };
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to retrieve data from IndexedDB"));
    };
  });
}

export async function deleteFromReminders(noteId: string) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      if (request.readyState === "done") {
        //console.log("request.onsuccess - getAllData");
        const db = request.result;
        const tx = db.transaction("reminders", "readwrite");
        const store = tx.objectStore("reminders");
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = async function (event: any) {
          if (event.target && event.target.result) {
            let cursor = event.target.result;

            if (cursor) {
              if (cursor.value.value.noteId === noteId) {
                cursor.delete();
                //console.log("Deleted note with id: ", noteId);
                resolve(true);
              } else {
                // Move to the next object in the store
                cursor.continue();
              }
            } else {
              // Resolve the promise when the cursor is exhausted and no match is found
              resolve(true);
            }
          }
        };
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to retrieve data from IndexedDB"));
    };
  });
}
