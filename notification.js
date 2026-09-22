// ============================================
// DANNY SMART POWER
// FRESH WEB NOTIFICATION SYSTEM
// STEP 2 - NOTIFICATION REGISTRATION
// ============================================

const DSP_VAPID_KEY =
  "BFTvpM4Gy807AEVK5SpAZud3kjGdC4zsxlBpfC-jJLALKaxcqwjCMMPY3MI5NAjd5ZjLXQWutZ43WdBqlgAc8Q";

async function registerDannySmartPowerNotifications() {
  try {

    console.log("Starting Danny Smart Power notification setup...");

    // --------------------------------------------
    // CHECK BROWSER SUPPORT
    // --------------------------------------------

    if (!("Notification" in window)) {
      throw new Error(
        "This browser does not support notifications."
      );
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error(
        "This browser does not support service workers."
      );
    }

    // --------------------------------------------
    // CHECK FIREBASE
    // --------------------------------------------

    if (
      typeof firebase === "undefined" ||
      !firebase.apps ||
      !firebase.apps.length
    ) {
      throw new Error(
        "Firebase has not been initialized."
      );
    }

    const auth = firebase.auth();

    // --------------------------------------------
    // WAIT FOR FIREBASE AUTH TO RESTORE LOGIN
    // --------------------------------------------

    const user = await new Promise((resolve) => {

      // If Firebase already knows the user
      if (auth.currentUser) {
        resolve(auth.currentUser);
        return;
      }

      // Otherwise wait for Firebase Auth
      // to restore the existing login session
      const unsubscribe =
        auth.onAuthStateChanged((currentUser) => {

          unsubscribe();

          resolve(currentUser || null);

        });

    });

    console.log(
      "Firebase authentication check completed."
    );

    if (!user) {
      throw new Error(
        "Firebase could not find the logged-in account. Please log out and log in again."
      );
    }

    console.log(
      "Logged-in user:",
      user.uid
    );

    console.log(
      "Logged-in email:",
      user.email || "No email"
    );

    // --------------------------------------------
    // NOTIFICATION PERMISSION
    // --------------------------------------------

    let permission =
      Notification.permission;

    console.log(
      "Current notification permission:",
      permission
    );

    if (permission !== "granted") {

      permission =
        await Notification.requestPermission();

    }

    console.log(
      "Notification permission after request:",
      permission
    );

    if (permission !== "granted") {
      throw new Error(
        "Notification permission was not granted."
      );
    }

    // --------------------------------------------
    // REGISTER SERVICE WORKER
    // --------------------------------------------

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log(
      "Firebase messaging service worker registered."
    );

    await navigator.serviceWorker.ready;

    console.log(
      "Firebase messaging service worker is ready."
    );

    // --------------------------------------------
    // FIREBASE CLOUD MESSAGING
    // --------------------------------------------

    const messaging =
      firebase.messaging();

    const token =
      await messaging.getToken({
        vapidKey: DSP_VAPID_KEY,
        serviceWorkerRegistration:
          registration
      });

    if (!token) {
      throw new Error(
        "Firebase did not generate a notification token."
      );
    }

    console.log(
      "Firebase notification token created successfully."
    );

    // --------------------------------------------
    // SAVE DEVICE TOKEN
    // --------------------------------------------

    const db =
      firebase.firestore();

    const tokenRef =
      db
        .collection("notificationTokens")
        .doc(user.uid);

    await tokenRef.set({

      userId: user.uid,

      email: user.email || "",

      token: token,

      platform: "web",

      notificationsEnabled: true,

      updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    }, {
      merge: true
    });

    console.log(
      "Notification device saved to Firestore."
    );

    // --------------------------------------------
    // VERIFY FIRESTORE SAVE
    // --------------------------------------------

    const savedToken =
      await tokenRef.get();

    if (!savedToken.exists) {

      throw new Error(
        "The notification device was not saved to Firestore."
      );

    }

    const savedData =
      savedToken.data();

    if (
      !savedData ||
      !savedData.token
    ) {

      throw new Error(
        "Firestore saved the notification record, but the token is missing."
      );

    }

    console.log(
      "===================================="
    );

    console.log(
      "DANNY SMART POWER NOTIFICATIONS READY"
    );

    console.log(
      "User:",
      user.uid
    );

    console.log(
      "Platform:",
      savedData.platform
    );

    console.log(
      "Notification enabled:",
      savedData.notificationsEnabled
    );

    console.log(
      "===================================="
    );

    return true;

  } catch (error) {

    console.error(
      "Danny Smart Power notification setup failed:"
    );

    console.error(error);

    throw error;

  }
}
