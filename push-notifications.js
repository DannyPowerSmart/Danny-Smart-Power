/* =====================================================
   DANNY SMART POWER
   PUSH NOTIFICATION MESSAGE HANDLER
===================================================== */

try {

    if (
        typeof firebase !== "undefined" &&
        firebase.messaging
    ) {

        const messaging = firebase.messaging();


        /* =================================================
           FOREGROUND NOTIFICATIONS
        ================================================= */

        messaging.onMessage((payload) => {

            console.log(
                "Danny Smart Power notification received:",
                payload
            );


            const title =
                payload.notification?.title ||
                "Danny Smart Power";


            const body =
                payload.notification?.body ||
                "You have a new notification.";


            /* =============================================
               SHOW NOTIFICATION WHEN PERMISSION IS GRANTED
            ============================================= */

            if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {

                new Notification(title, {

                    body: body,

                    icon: "/icon-192.png"

                });

            }

        });


        console.log(
            "Danny Smart Power push notification handler loaded."
        );

    }

}
catch(error){

    console.error(
        "Push notification handler error:",
        error
    );

}
