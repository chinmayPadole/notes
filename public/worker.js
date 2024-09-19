/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting(); // Activate the service worker immediately
});

self.addEventListener("activate", async (event) => {
  console.log("Service Worker activating.");

  // console.log(response);
  // event.waitUntil(
  //   self.clients.claim() // Take control of uncontrolled clients as soon as possible
  // );
});

self.addEventListener("push", async function (event) {
  // console.log("push received", event);
  const usernameData = await readFromIndexedDB("username");
  const username =
    usernameData.length > 0 ? usernameData[0].value.username : "";
  const data = event.data ? event.data.json() : {};
  if (data.type && data.type === "CHECK_REMINDERS") {
    const remindersData = await readFromIndexedDB("reminders");

    //const reminders = dueReminders(remindersData);
    const reminders = remindersData;
    reminders.forEach((reminder) => {
      const options = {
        body: reminder.value.reminderText,
        icon: "./icons-144.png",
        badge: "./icons-144.png",
        image: reminder.value.reminderImage,
        requireInteraction: true,
        title: "Super notes Reminder!",
        priority: "high",
        renotify: true,
        tag: "new-reminder",
        actions: [
          {
            action: "view",
            title: "View",
          },
          {
            action: "snooze",
            title: "Snooze",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ],
        data: {
          noteId: reminder.value.noteId,
        },
        timestamp: reminder.value.reminderDate,
      };

      self.registration.showNotification(
        `Hey ${username} Super notes Reminder!`,
        options
      );
    });

    // Delete sent reminders
    //await deleteFromIndexedDB(reminders);
  }

  // const options = {
  //   body: data.body,
  //   icon: data.icon,
  //   badge: data.badge,
  // };
  // self.registration.showNotification(data.title, options);
});

self.addEventListener("notificationclick", async function (event) {
  event.notification.close();
  if (event.action === "dismiss") {
    // DELETE NOTE
    await deleteFromIndexedDB(event.notification.data.noteId);
  } else if (event.action === "snooze") {
    await reInsertIntoIndexedDB(event.notification.data.noteId);
  } else {
    console.log("notification click", event);

    self.clients.openWindow(`/?noteId=${event.notification.data.noteId}`);
    await deleteFromIndexedDB(event.notification.data.noteId);
  }
});

self.addEventListener("message", function (event) {
  const data = event.data;

  if (data && data.type === "TRIGGER_PUSH") {
    const options = {
      body: data.body,
      icon: "./icons-144.png",
      badge: "./icons-144.png",
      image: data.image,
      requireInteraction: true,
      title: "Super notes Reminder!",
      priority: "high",
      renotify: true,
      tag: "new-reminder",
      actions: [
        {
          action: "view",
          title: "View",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      data: {
        noteId: data.noteId,
      },
      timestamp: data.reminderDate,
    };

    self.registration.showNotification(data.title, options);
  }
});

function dueReminders(reminders) {
  const remindersToFire = reminders.filter(
    (x) => new Date(x.value.reminderDate).getTime() < new Date().getTime()
  );

  return remindersToFire;
}

// INDEXD DB READER LOGIC
async function readFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      if (request.readyState === "done") {
        console.log("request.onsuccess - getAllData");
        const db = request.result;
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

async function deleteFromIndexedDB(noteId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      if (request.readyState === "done") {
        console.log("request.onsuccess - getAllData");
        const db = request.result;
        const tx = db.transaction("reminders", "readwrite");
        const store = tx.objectStore("reminders");
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = async function (event) {
          let cursor = event.target.result;

          if (cursor) {
            if (cursor.value.value.noteId === noteId) {
              cursor.delete();
              console.log("Deleted note with id: ", noteId);
              resolve();
            } else {
              // Move to the next object in the store
              cursor.continue();
            }
          } else {
            // Resolve the promise when the cursor is exhausted and no match is found
            resolve();
          }
        };
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to retrieve data from IndexedDB"));
    };
  });
}

async function reInsertIntoIndexedDB(noteId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      if (request.readyState === "done") {
        console.log("request.onsuccess - getAllData");
        const db = request.result;
        const tx = db.transaction("reminders", "readwrite");
        const store = tx.objectStore("reminders");
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = function (event) {
          let cursor = event.target.result;

          if (cursor) {
            if (cursor.value.value.noteId === noteId) {
              const snoozeItem = cursor.value.value;
              cursor.delete();

              snoozeItem.reminderDate = new Date(
                new Date().getTime() + 30 * 60000
              );
              store.add({ value: snoozeItem });
              console.log("Snoozed note with id: ", noteId);

              resolve();
            } else {
              // Move to the next object in the store
              cursor.continue();
            }
          } else {
            resolve();
          }
        };
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to retrieve data from IndexedDB"));
    };
  });
}
// END
