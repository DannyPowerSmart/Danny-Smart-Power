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
    // 1. Check browser notification support
    // --------------------------------------------

    if (!("Notification" in window)) {
      throw new Error(
        "This browser does not support notifications."
      );
    }


    // --------------------------------------------
    // 2. Check service worker support
    // --------------------------------------------

    if (!("serviceWorker" in navigator)) {
      throw new Error(
        "This browser does not support service workers."
      );
    }


    // --------------------------------------------
    // 3. Check Firebase
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


    // --------------------------------------------
    // 4. Check logged-in customer
    // --------------------------------------------

    const auth = firebase.auth();

    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "Please log in before enabling notifications."
      );
    }


    // --------------------------------------------
    // 5. Ask for notification permission
    // --------------------------------------------

    let permission = Notification.permission;

    if (permission !== "granted") {

      permission =
        await Notification.requestPermission();

    }

    console.log(
      "Notification permission:",
      permission
    );


    if (permission !== "granted") {
      throw new Error(
        "Notification permission was not granted."
      );
    }


    // --------------------------------------------
    // 6. Register Firebase messaging service worker
    // --------------------------------------------

    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    console.log(
      "Firebase messaging service worker registered."
    );


    // --------------------------------------------
    // 7. Wait until service worker is ready
    // --------------------------------------------

    await navigator.serviceWorker.ready;


    // --------------------------------------------
    // 8. Get Firebase Messaging
    // --------------------------------------------

    const messaging =
      firebase.messaging();


    // --------------------------------------------
    // 9. Generate notification token
    // --------------------------------------------

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
      "Firebase notification token created."
    );


    // --------------------------------------------
    // 10. Save notification device
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


    // --------------------------------------------
    // 11. Verify Firestore save
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
