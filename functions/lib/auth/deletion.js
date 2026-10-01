"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const params_1 = require("firebase-functions/params");
const revenuecatSecret = (0, params_1.defineSecret)('REVENUECAT_SECRET_API_KEY');
exports.deleteUserAccount = (0, https_1.onCall)({ secrets: [revenuecatSecret] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be logged in to delete your account.');
    }
    const uid = request.auth.uid;
    const db = (0, firestore_1.getFirestore)();
    try {
        console.info(`Starting account deletion for uid: ${uid}`);
        // 1. Delete from RevenueCat
        const rcApiKey = revenuecatSecret.value();
        console.info(`Attempting to delete subscriber ${uid} from RevenueCat`);
        const rcResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${uid}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${rcApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        if (!rcResponse.ok && rcResponse.status !== 404) {
            const errText = await rcResponse.text();
            console.error(`RevenueCat deletion failed for ${uid}: ${rcResponse.status} ${errText}`);
            throw new Error("Failed to delete user from RevenueCat");
        }
        console.info(`Successfully processed RevenueCat deletion for uid: ${uid}`);
        // 2. Delete from Firestore
        console.info(`Attempting to delete Firestore data for uid: ${uid}`);
        const userRef = db.collection('users').doc(uid);
        await db.recursiveDelete(userRef);
        console.info(`Successfully deleted Firestore data for uid: ${uid}`);
        // 3. Delete from Firebase Auth
        console.info(`Attempting to delete Firebase Auth user for uid: ${uid}`);
        try {
            await (0, auth_1.getAuth)().deleteUser(uid);
            console.info(`Successfully deleted Firebase Auth user for uid: ${uid}`);
        }
        catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                console.info(`Firebase Auth user for uid: ${uid} already absent. Treating as success.`);
            }
            else {
                throw authError;
            }
        }
        return { success: true };
    }
    catch (error) {
        console.error(`Error deleting user account for uid ${uid}:`, error);
        throw new https_1.HttpsError('internal', 'An error occurred while deleting the account.');
    }
});
//# sourceMappingURL=deletion.js.map