import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { defineSecret } from 'firebase-functions/params';

const revenuecatSecret = defineSecret('REVENUECAT_SECRET_API_KEY');

export const deleteUserAccount = onCall(
  { secrets: [revenuecatSecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be logged in to delete your account.'
      );
    }

    const uid = request.auth.uid;
    const db = getFirestore();

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
        await getAuth().deleteUser(uid);
        console.info(`Successfully deleted Firebase Auth user for uid: ${uid}`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.info(`Firebase Auth user for uid: ${uid} already absent. Treating as success.`);
        } else {
          throw authError;
        }
      }

      return { success: true };
    } catch (error) {
      console.error(`Error deleting user account for uid ${uid}:`, error);
      throw new HttpsError(
        'internal',
        'An error occurred while deleting the account.'
      );
    }
  }
);
