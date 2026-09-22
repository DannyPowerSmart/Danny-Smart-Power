// ============================================
// DANNY SMART POWER
// Central Web Push Notification Registration
// ============================================

const DSP_NOTIFICATION_VAPID_KEY =
"BFTvpM4Gy807AEVK5SpAZud3kjGdC4zsxlBpfC-jJLALKaxcqwjCMMPY3MI5NAjd5ZjLXQWutZ43WdBqlgAc8Q";

async function registerDSPNotifications() {

  try {

    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return null;
    }

    if (!firebase || !firebase.messaging) {
      console.error("Firebase Messaging is not available.");
      return null;
    }

    const user = firebase.auth().currentUser;

    if (!user) {
      console.log("No logged-in user.");
      return null;
    }

    // Ask permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission was not granted.");
      return null;
    }

    // Register the Firebase service worker
    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    const messaging = firebase.messaging();

    // Get FCM token
    const token = await messaging.getToken({
      vapidKey: DSP_NOTIFICATION_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      console.log("No FCM token was generated.");
      return null;
    }

    // Save token under the logged-in user's account
    await firebase.firestore()
      .collection("notificationTokens")
      .doc(user.uid)
      .set({
        userId: user.uid,
        token: token,
        platform: "web",
        notificationsEnabled: true,
        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      }, {
        merge: true
      });

    console.log("Danny Smart Power notification registration successful.");

    return token;

  } catch (error) {

    console.error(
      "Danny Smart Power notification registration failed:",
      error
    );

    return null;
  }
}
