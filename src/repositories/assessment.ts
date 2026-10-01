import { collection, doc, setDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AssessmentSession, AssessmentResponse, BehavioralSignal } from '@/types/models';

export const getAssessmentSessionsRef = (uid: string) => collection(db, `users/${uid}/assessmentSessions`);
export const getAssessmentResponsesRef = (uid: string, sessionId: string) => collection(db, `users/${uid}/assessmentSessions/${sessionId}/responses`);

export const createAssessmentSession = async (uid: string, data: Omit<AssessmentSession, 'id' | 'startedAt'>) => {
  const newRef = doc(getAssessmentSessionsRef(uid));
  const session: AssessmentSession = {
    id: newRef.id,
    ...data,
    startedAt: Timestamp.now(),
  };
  await setDoc(newRef, session);
  return session;
};

export const completeAssessmentSession = async (uid: string, sessionId: string) => {
  const ref = doc(db, `users/${uid}/assessmentSessions/${sessionId}`);
  await setDoc(ref, { completedAt: Timestamp.now() }, { merge: true });
};

export const saveAssessmentResponse = async (
  uid: string, 
  sessionId: string, 
  data: Omit<AssessmentResponse, 'id' | 'createdAt'>
) => {
  const newRef = doc(getAssessmentResponsesRef(uid, sessionId));
  const response: AssessmentResponse = {
    id: newRef.id,
    ...data,
    createdAt: Timestamp.now(),
  };
  await setDoc(newRef, response);
  return response;
};

export const getAssessmentResponses = async (uid: string, sessionId: string): Promise<AssessmentResponse[]> => {
  const snap = await getDocs(getAssessmentResponsesRef(uid, sessionId));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as AssessmentResponse));
};

export const saveBehavioralSignal = async (uid: string, portfolioId: string, signal: Omit<BehavioralSignal, 'id'>) => {
  const newRef = doc(collection(db, `users/${uid}/portfolios/${portfolioId}/behavioralSignals`));
  await setDoc(newRef, {
    id: newRef.id,
    ...signal,
  });
};
