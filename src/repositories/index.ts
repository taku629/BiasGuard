import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Portfolio, Holding, Transaction, NewsReadLog, BiasScore } from '../types/models';
import { PortfolioSchema, HoldingSchema, TransactionSchema } from '../schema/models';

export const getPortfolioRef = (uid: string, portfolioId: string) => doc(db, 'users', uid, 'portfolios', portfolioId);
export const getPortfoliosRef = (uid: string) => collection(db, 'users', uid, 'portfolios');

export const getHoldingRef = (uid: string, portfolioId: string, holdingId: string) => doc(db, 'users', uid, 'portfolios', portfolioId, 'holdings', holdingId);
export const getHoldingsRef = (uid: string, portfolioId: string) => collection(db, 'users', uid, 'portfolios', portfolioId, 'holdings');

export const getTransactionsRef = (uid: string, portfolioId: string, holdingId: string) => collection(db, 'users', uid, 'portfolios', portfolioId, 'holdings', holdingId, 'transactions');

// --- Portfolios ---
export const createPortfolio = async (uid: string, data: Omit<Portfolio, 'id' | 'createdAt'>) => {
  const newRef = doc(getPortfoliosRef(uid));
  const portfolio: Portfolio = {
    id: newRef.id,
    ...data,
    createdAt: Timestamp.now(),
  };
  PortfolioSchema.parse(portfolio);
  await setDoc(newRef, portfolio);
  return portfolio;
};

export const updatePortfolio = async (uid: string, portfolioId: string, data: Partial<Omit<Portfolio, 'id' | 'createdAt'>>) => {
  const ref = getPortfolioRef(uid, portfolioId);
  const updateData = { ...data, updatedAt: Timestamp.now() };
  await updateDoc(ref, updateData);
};

export const deletePortfolio = async (uid: string, portfolioId: string) => {
  const ref = getPortfolioRef(uid, portfolioId);
  await deleteDoc(ref);
};

export const subscribePortfolios = (uid: string, onUpdate: (portfolios: Portfolio[]) => void) => {
  const q = query(getPortfoliosRef(uid));
  return onSnapshot(q, (snapshot) => {
    const portfolios = snapshot.docs.map(doc => doc.data() as Portfolio);
    onUpdate(portfolios.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
  });
};

// --- Holdings ---
export const addHolding = async (uid: string, portfolioId: string, data: Omit<Holding, 'id' | 'createdAt'>) => {
  const newRef = doc(getHoldingsRef(uid, portfolioId));
  const holding: Holding = {
    id: newRef.id,
    ...data,
    createdAt: Timestamp.now(),
  };
  HoldingSchema.parse(holding);
  await setDoc(newRef, holding);
  return holding;
};

export const updateHolding = async (uid: string, portfolioId: string, holdingId: string, data: Partial<Omit<Holding, 'id' | 'createdAt'>>) => {
  const ref = getHoldingRef(uid, portfolioId, holdingId);
  const updateData = { ...data, updatedAt: Timestamp.now() };
  await updateDoc(ref, updateData);
};

export const deleteHolding = async (uid: string, portfolioId: string, holdingId: string) => {
  const ref = getHoldingRef(uid, portfolioId, holdingId);
  await deleteDoc(ref);
};

export const subscribeHoldings = (uid: string, portfolioId: string, onUpdate: (holdings: Holding[]) => void) => {
  const q = query(getHoldingsRef(uid, portfolioId));
  return onSnapshot(q, (snapshot) => {
    const holdings = snapshot.docs.map(doc => doc.data() as Holding);
    onUpdate(holdings.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
  });
};

// --- Transactions ---
export const addTransaction = async (uid: string, portfolioId: string, holdingId: string, data: Omit<Transaction, 'id' | 'executedAt'>) => {
  const newRef = doc(getTransactionsRef(uid, portfolioId, holdingId));
  const transaction: Transaction = {
    id: newRef.id,
    ...data,
    executedAt: Timestamp.now(),
  };
  TransactionSchema.parse(transaction);
  await setDoc(newRef, transaction);
  return transaction;
};

// --- PriceHistory Interface ---
export interface IPriceHistoryRepository {
  getPriceHistory(ticker: string, startDate: Date, endDate: Date): Promise<any[]>;
}

export class MockPriceHistoryRepository implements IPriceHistoryRepository {
  async getPriceHistory(ticker: string, startDate: Date, endDate: Date): Promise<any[]> {
    // 外部API実装までのモック
    return [];
  }
}

export * from './transaction';
export * from './assessment';
