importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB48Z_i8k3gV3uHmNUFQjAH9bOvUlAGb44",
  authDomain: "danny-smart-power.firebaseapp.com",
  projectId: "danny-smart-power",
  storageBucket: "danny-smart-power.firebasestorage.app",
  messagingSenderId: "649735645158",
  appId: "1:649735645158:web:cff518b89721a163679827"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const title =
    payload.notification?.title ||
    "Danny Smart Power";

  const options = {
    body:
      payload.notification?.body ||
      "You have a new notification.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data || {}
  };

  self.registration.showNotification(
    title,
    options
  );

});
