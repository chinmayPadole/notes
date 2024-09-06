/* eslint-disable no-restricted-globals */

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting(); // Activate the service worker immediately
});

self.addEventListener("activate", async (event) => {
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      "BBhZ-u4r7sUTWbT7Dt5vrWU_dMvw45MrKSWNtQQbSnBLgV-MTfGXU37dadCBeMGWy27qI8j5OFQD-AbdRriF0aM"
    ),
  });
  console.log(subscription);
  console.log("Service Worker activating.");

  const response = await saveSubscription(subscription);
  // console.log(response);
  // event.waitUntil(
  //   self.clients.claim() // Take control of uncontrolled clients as soon as possible
  // );
});

const saveSubscription = async (subscription) => {
  const response = await fetch(
    "https://supernotes.chinmaypadole97.workers.dev/api/notifications/subscribe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    }
  );

  return response;
};

self.addEventListener("push", async function (event) {
  // console.log("push received", event);
  const data = event.data ? event.data.json() : {};
  if (data.type && data.type === "CHECK_REMINDERS") {
    const remindersData = await readFromIndexedDB("reminders");

    const reminders = dueReminders(remindersData);
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
            action: "dismiss",
            title: "Dismiss",
          },
        ],
        data: {
          noteId: reminder.value.noteId,
        },
        timestamp: reminder.value.reminderDate,
      };

      self.registration.showNotification("Super notes Reminder!", options);
    });

    // Delete sent reminders
    await deleteFromIndexedDB(reminders);
  }

  // const options = {
  //   body: data.body,
  //   icon: data.icon,
  //   badge: data.badge,
  // };
  // self.registration.showNotification(data.title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.action === "dismiss") {
  } else {
    console.log("notification click", event);
    event.waitUntil(
      self.clients.openWindow(`/?noteId=${event.notification.data.noteId}`)
    );
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

async function deleteFromIndexedDB(reminders) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("supernotes");

    request.onsuccess = () => {
      if (request.readyState === "done") {
        console.log("request.onsuccess - getAllData");
        const db = request.result;
        const tx = db.transaction("reminders", "readonly");
        const store = tx.objectStore("reminders");
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = function (event) {
          let cursor = event.target.result;

          reminders.forEach((reminder) => {
            if (cursor) {
              if (cursor.value.noteId === reminder.value.noteId) {
                cursor.delete();
                console.log("Deleted note with id: ", reminder.value.noteId);
              }
              // Move to the next object in the store
              cursor.continue();
            }
          });
        };
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to retrieve data from IndexedDB"));
    };
  });
}
// END
