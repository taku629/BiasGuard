import { deleteUserAccount } from '../../src/auth/deletion';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

jest.mock('firebase-functions/v2/https', () => ({
  onCall: jest.fn((options, handler) => {
    const actualHandler = handler || options;
    const wrapped = async (req: any) => actualHandler(req);
    wrapped.run = wrapped;
    return wrapped;
  }),
  HttpsError: class extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  }
}));

jest.mock('firebase-functions/params', () => ({
  defineSecret: jest.fn(() => ({
    value: jest.fn(() => 'mock-secret-key')
  }))
}));

jest.mock('firebase-admin/firestore', () => {
  const recursiveDelete = jest.fn();
  const refMock = { collection: jest.fn() };
  const firestoreMock = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => refMock)
    })),
    recursiveDelete
  };
  return {
    getFirestore: jest.fn(() => firestoreMock),
  };
});

jest.mock('firebase-admin/auth', () => {
  const deleteUser = jest.fn();
  return {
    getAuth: jest.fn(() => ({
      deleteUser
    }))
  };
});

describe('deleteUserAccount retry scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  const req = {
    auth: { uid: 'test-user-id' }
  };

  it('RevenueCat already absent (404) -> proceeds to Firestore -> Auth', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Not found')
    });
    
    const db = getFirestore();
    const auth = getAuth();
    
    (db.recursiveDelete as jest.Mock).mockResolvedValueOnce(undefined);
    (auth.deleteUser as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await (deleteUserAccount as any).run(req);
    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalled();
    expect(db.recursiveDelete).toHaveBeenCalled();
    expect(auth.deleteUser).toHaveBeenCalled();
  });

  it('Firestore already absent -> proceeds to Auth', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });
    
    const db = getFirestore();
    const auth = getAuth();
    
    (db.recursiveDelete as jest.Mock).mockResolvedValueOnce(undefined);
    (auth.deleteUser as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await (deleteUserAccount as any).run(req);
    expect(result).toEqual({ success: true });
    expect(auth.deleteUser).toHaveBeenCalled();
  });

  it('Auth user not found -> treats as success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });
    
    const db = getFirestore();
    const auth = getAuth();
    
    (db.recursiveDelete as jest.Mock).mockResolvedValueOnce(undefined);
    const authError = new Error('User not found');
    (authError as any).code = 'auth/user-not-found';
    (auth.deleteUser as jest.Mock).mockRejectedValueOnce(authError);

    const result = await (deleteUserAccount as any).run(req);
    expect(result).toEqual({ success: true });
    expect(auth.deleteUser).toHaveBeenCalled();
  });

  it('Partial failure in Auth -> does not return complete success, throws error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });
    
    const db = getFirestore();
    const auth = getAuth();
    
    (db.recursiveDelete as jest.Mock).mockResolvedValueOnce(undefined);
    const authError = new Error('Some other error');
    (authError as any).code = 'auth/internal-error';
    (auth.deleteUser as jest.Mock).mockRejectedValueOnce(authError);

    await expect((deleteUserAccount as any).run(req)).rejects.toThrow('An error occurred while deleting the account.');
  });
});
