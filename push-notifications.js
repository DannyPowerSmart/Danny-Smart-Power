const messaging = firebase.messaging();

const VAPID_KEY =
"BFTvpM4Gy807AEVK5SpAZud3kjGdC4zsxlBpfC-jJLALKaxcqwjCMMPY3MIk5NAjd5ZjLXQWutZ43WdBqlgAc8Q";


/* =====================================================
   WAIT FOR FIREBASE AUTH
===================================================== */

function waitForLoggedInUser(){

    return new Promise((resolve) => {

        const existingUser =
            firebase.auth().currentUser;

        if(existingUser){

            resolve(existingUser);

            return;

        }


        const unsubscribe =
            firebase.auth().onAuthStateChanged(
                (user) => {

                    unsubscribe();

                    resolve(user);

                }
            );

    });

}


/* =====================================================
   ENABLE PUSH NOTIFICATIONS
===================================================== */

async function enablePushNotifications(){

    try{

        console.log(
            "Starting notification setup..."
        );


        /* =============================================
           CHECK NOTIFICATION SUPPORT
        ============================================= */

        if(!("Notification" in window)){

            throw new Error(
                "This browser does not support notifications."
            );

        }


        /* =============================================
           CHECK SERVICE WORKER
        ============================================= */

        if(!("serviceWorker" in navigator)){

            throw new Error(
                "This browser does not support service workers."
            );

        }


        /* =============================================
           REQUEST PERMISSION
        ============================================= */

        let permission =
            Notification.permission;


        if(permission !== "granted"){

            permission =
                await Notification.requestPermission();

        }


        console.log(
            "Notification permission:",
            permission
        );


        if(permission !== "granted"){

            throw new Error(
                "Notification permission was not granted."
            );

        }


        /* =============================================
           REGISTER SERVICE WORKER
        ============================================= */

        console.log(
            "Registering Firebase messaging service worker..."
        );


        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );


        console.log(
            "Service worker registered:",
            registration
        );


        /* =============================================
           WAIT FOR SERVICE WORKER
        ============================================= */

        await navigator.serviceWorker.ready;


        /* =============================================
           GET FCM TOKEN
        ============================================= */

        console.log(
            "Requesting FCM token..."
        );


        const token =
            await messaging.getToken({

                vapidKey: VAPID_KEY,

                serviceWorkerRegistration:
                    registration

            });


        console.log(
            "FCM token:",
            token
        );


        if(!token){

            throw new Error(
                "Firebase did not generate a notification token."
            );

        }


        /* =============================================
           GET LOGGED-IN CUSTOMER
        ============================================= */

        const user =
            await waitForLoggedInUser();


        if(!user){

            throw new Error(
                "No logged-in customer was found."
            );

        }


        console.log(
            "Logged-in customer:",
            user.uid
        );


        /* =============================================
           FIRESTORE
        ============================================= */

        const db =
            firebase.firestore();


        /* =============================================
           TOKEN DOCUMENT
        ============================================= */

        const tokenRef =
            db
                .collection("users")
                .doc(user.uid)
                .collection("pushTokens")
                .doc(token);


        /* =============================================
           SAVE TOKEN
        ============================================= */

        await tokenRef.set({

            token: token,

            userId: user.uid,

            email: user.email || "",

            platform: "web",

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        }, {

            merge:true

        });


        console.log(
            "===================================="
        );

        console.log(
            "PUSH TOKEN SAVED SUCCESSFULLY"
        );

        console.log(
            "User:",
            user.uid
        );

        console.log(
            "===================================="
        );


        return token;


    }

    catch(error){

        console.error(
            "===================================="
        );

        console.error(
            "PUSH NOTIFICATION ERROR"
        );

        console.error(
            error
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code || "No Firebase error code"
        );

        console.error(
            "===================================="
        );


        /*
         * Show the actual problem temporarily.
         * This makes troubleshooting much easier.
         */

        alert(
            "Notification setup failed:\n\n" +
            error.message
        );


        return null;

    }

}
