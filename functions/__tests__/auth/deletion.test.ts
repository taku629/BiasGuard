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

import { deleteUserAccount } from '../../src/auth/deletion';

jest.mock('firebase-admin/firestore', () => {
  const recursiveDeleteMock = jest.fn();
  
  const refMock = {
    collection: jest.fn(),
  };
  
  const firestoreMock = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => refMock)
    })),
    recursiveDelete: recursiveDeleteMock
  };

  return {
    getFirestore: jest.fn(() => firestoreMock),
  };
});

const deleteUserMock = jest.fn();
jest.mock('firebase-admin/auth', () => {
  return {
    getAuth: jest.fn(() => ({
      deleteUser: deleteUserMock
    }))
  };
});

jest.mock('firebase-functions/params', () => ({
  defineSecret: jest.fn(() => ({
    value: jest.fn(() => 'mock-secret-key')
  }))
}));

describe('deleteUserAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue('OK')
    });
  });

  it('should throw an error if unauthenticated', async () => {
    const req = { data: {} };
    await expect(deleteUserAccount.run(req as any)).rejects.toThrow('You must be logged in to delete your account.');
  });

  it('should use recursiveDelete to delete user documents', async () => {
    const authContext = { uid: 'test-user-id', token: {} };
    
    await deleteUserAccount.run({
      data: {},
      auth: authContext
    } as any);

    const { getFirestore } = require('firebase-admin/firestore');
    const firestore = getFirestore();

    expect(firestore.collection).toHaveBeenCalledWith('users');
    expect(firestore.recursiveDelete).toHaveBeenCalled();
    expect(deleteUserMock).toHaveBeenCalledWith('test-user-id');
  });
});
