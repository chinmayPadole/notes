/* eslint-disable no-restricted-globals */
// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open("my-pwa-cache").then((cache) => {
//       return cache.addAll([
//         "/",
//         "/index.html",
//         "/manifest.json",
//         "/static/js/bundle.js",
//         // Add other assets and routes to cache
//       ]);
//     })
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting(); // Activate the service worker immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(
    self.clients.claim() // Take control of uncontrolled clients as soon as possible
  );
});

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  console.log("push received", data);
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
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
