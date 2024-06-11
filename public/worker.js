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
  event.waitUntil(self.clients.openWindow("/"));
});

self.addEventListener("message", function (event) {
  const data = event.data;

  console.log("Recived PUSH Message", data);

  if (data && data.type === "TRIGGER_PUSH") {
    const options = {
      body: data.body,
      icon: "/icon.png",
      badge: "/badge.png",
      actions: [
        {
          action: "view",
          title: "View",
        },
      ],
    };

    this.setTimeout(() => {
      self.registration.showNotification(data.title, options);
    }, data.delay);
  }
});
