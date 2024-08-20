const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Clerk } = require('@clerk/clerk-sdk-node');

admin.initializeApp();

exports.verifyClerkToken = functions.https.onCall(async (data) => {
    const { token } = data;

    try {
        // Initialize Clerk with your API key
        const clerk = Clerk({ apiKey: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' });
        const user = await clerk.verifySession(token);

        // Generate Firebase custom token
        const firebaseToken = await admin.auth().createCustomToken(user.id);
        return { token: firebaseToken };
    } catch (error) {
        console.error('Error verifying Clerk token:', error);
        throw new functions.https.HttpsError('unauthenticated', 'Invalid Clerk token.');
    }
});