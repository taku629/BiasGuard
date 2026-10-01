import { getFunctions, httpsCallable } from 'firebase/functions';
import { deleteUser } from 'firebase/auth';
import { app, auth } from '@/config/firebase'; // Assuming firebase config is exported here

export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in.');
  }

  try {
    const functions = getFunctions(app);
    // Call the callable function to delete user data (and RevenueCat data)
    const deleteFn = httpsCallable(functions, 'deleteUserAccount');
    await deleteFn();

    // Finally delete the user from Firebase Auth
    await deleteUser(user);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw error;
    }
    console.error('Account deletion failed:', error);
    throw new Error('Failed to delete account. Please try again later.');
  }
};
