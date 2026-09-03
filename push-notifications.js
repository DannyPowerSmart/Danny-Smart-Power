const messaging = firebase.messaging();

const VAPID_KEY =
"BFTvpM4Gy807AEVK5SpAZud3kjGdC4zsxlBpfC-jJLALKaxcqwjCMMPY3MIk5NAjd5ZjLXQWutZ43WdBqlgAc8Q";


async function enablePushNotifications(){

    try{

        if(!("Notification" in window)){

            alert(
                "This browser does not support notifications."
            );

            return null;
        }


        const permission =
            await Notification.requestPermission();


        if(permission !== "granted"){

            console.log(
                "Notification permission was not granted."
            );

            return null;
        }


        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );


        const token =
            await messaging.getToken({

                vapidKey: VAPID_KEY,

                serviceWorkerRegistration:
                    registration

            });


        if(!token){

            console.log(
                "No notification token was generated."
            );

            return null;
        }


        console.log(
            "FCM Token:",
            token
        );


        /* =========================================
           GET CURRENT CUSTOMER
        ========================================= */

        const user =
            firebase.auth().currentUser;


        if(!user){

            console.log(
                "User is not logged in. Token generated but not saved."
            );

            return token;
        }


        /* =========================================
           FIRESTORE
        ========================================= */

        const db =
            firebase.firestore();


        /* =========================================
           SAVE PUSH TOKEN
        ========================================= */

        await db
            .collection("users")
            .doc(user.uid)
            .collection("pushTokens")
            .doc(token)
            .set({

                token: token,

                userId: user.uid,

                email: user.email || "",

                platform: "web",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            }, { merge:true });


        console.log(
            "Push notification token saved successfully."
        );


        return token;


    }catch(error){

        console.error(
            "Push notification setup failed:",
            error
        );

        return null;

    }

}
