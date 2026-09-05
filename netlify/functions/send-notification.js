const admin = require("firebase-admin");

const ADMIN_UID = "mJn7uuuqW8RYwILcLtjPrYFvf4P2";

if (!admin.apps.length) {
    const serviceAccount =
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const messaging = admin.messaging();

function response(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization",
            "Access-Control-Allow-Methods":
                "POST, OPTIONS"
        },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {

    if (event.httpMethod === "OPTIONS") {
        return response(200, {
            success: true
        });
    }

    if (event.httpMethod !== "POST") {
        return response(405, {
            success: false,
            error: "Method not allowed."
        });
    }

    try {

        const authorization =
            event.headers.authorization ||
            event.headers.Authorization;

        if (!authorization) {
            return response(401, {
                success: false,
                error: "Authorization required."
            });
        }

        if (!authorization.startsWith("Bearer ")) {
            return response(401, {
                success: false,
                error: "Invalid authorization format."
            });
        }

        const idToken =
            authorization.substring(7);

        const decodedToken =
            await admin.auth().verifyIdToken(idToken);

        if (decodedToken.uid !== ADMIN_UID) {
            return response(403, {
                success: false,
                error:
                    "You are not authorized to send notifications."
            });
        }

        const body =
            JSON.parse(event.body || "{}");

        const title =
            String(
                body.title ||
                "Danny Smart Power"
            ).trim();

        const message =
            String(
                body.message ||
                "You have a new notification."
            ).trim();

        const userId =
            body.userId
                ? String(body.userId).trim()
                : "";

        const imageUrl =
            body.imageUrl
                ? String(body.imageUrl).trim()
                : "";

        const chatId =
            body.chatId
                ? String(body.chatId).trim()
                : "";

        const sourceId =
            body.sourceId
                ? String(body.sourceId).trim()
                : "";

        if (!title || !message) {
            return response(400, {
                success: false,
                error:
                    "Title and message are required."
            });
        }

        let tokens = [];

        if (userId) {

            const tokenSnapshot =
                await db
                    .collection("users")
                    .doc(userId)
                    .collection("pushTokens")
                    .get();

            tokens =
                tokenSnapshot.docs
                    .map(doc => doc.data().token)
                    .filter(Boolean);

        } else {

            const usersSnapshot =
                await db
                    .collection("users")
                    .get();

            for (const userDoc of usersSnapshot.docs) {

                const tokenSnapshot =
                    await db
                        .collection("users")
                        .doc(userDoc.id)
                        .collection("pushTokens")
                        .get();

                tokenSnapshot.docs.forEach(doc => {

                    const token =
                        doc.data().token;

                    if (token) {
                        tokens.push(token);
                    }

                });
            }
        }

        tokens = [...new Set(tokens)];

        if (tokens.length === 0) {
            return response(404, {
                success: false,
                error:
                    "No notification tokens found."
            });
        }

        const notificationMessage = {

            tokens: tokens,

            notification: {
                title: title,
                body: message,
                ...(imageUrl
                    ? { image: imageUrl }
                    : {})
            },

            data: {
                chatId: chatId,
                sourceId: sourceId,
                click_action:
                    chatId
                        ? "/chat.html"
                        : "/notification.html"
            },

            webpush: {

                notification: {
                    title: title,
                    body: message,
                    ...(imageUrl
                        ? { image: imageUrl }
                        : {})
                },

                fcmOptions: {
                    link:
                        chatId
                            ? "/chat.html"
                            : "/notification.html"
                }
            }
        };

        const result =
            await messaging.sendEachForMulticast(
                notificationMessage
            );

        console.log(
            "Notification result:",
            result.successCount,
            "successful,",
            result.failureCount,
            "failed."
        );

        return response(200, {

            success: true,

            message:
                "Notification sent.",

            totalTokens:
                tokens.length,

            successCount:
                result.successCount,

            failureCount:
                result.failureCount
        });

    } catch (error) {

        console.error(
            "Notification function error:",
            error
        );

        return response(500, {

            success: false,

            error:
                error.message ||
                "Notification sending failed."
        });
    }
};
