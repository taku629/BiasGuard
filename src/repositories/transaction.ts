import { collection, doc, runTransaction, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Transaction, Holding } from '@/types/models';

export const getTransactionsRef = (uid: string, portfolioId: string) => {
  return collection(db, `users/${uid}/portfolios/${portfolioId}/transactions`);
};

export const fetchTransactions = async (uid: string, portfolioId: string): Promise<Transaction[]> => {
  const q = query(
    getTransactionsRef(uid, portfolioId),
    orderBy('executedAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Transaction));
};

export const addTransactionAtomic = async (
  uid: string, 
  portfolioId: string, 
  transaction: Omit<Transaction, 'id'>, 
  holdingId: string
) => {
  const holdingRef = doc(db, `users/${uid}/portfolios/${portfolioId}/holdings/${holdingId}`);
  const txRef = doc(collection(db, `users/${uid}/portfolios/${portfolioId}/transactions`));

  await runTransaction(db, async (t) => {
    const holdingDoc = await t.get(holdingRef);
    if (!holdingDoc.exists()) {
      throw new Error('Holding not found');
    }

    const holding = holdingDoc.data() as Holding;
    const fees = transaction.fees || 0;

    if (transaction.type === 'buy') {
      const newQuantity = holding.quantity + transaction.quantity;
      const totalCost = (holding.quantity * holding.avgCost) + (transaction.quantity * transaction.price) + fees;
      const newAvgCost = totalCost / newQuantity;

      t.update(holdingRef, {
        quantity: newQuantity,
        avgCost: newAvgCost,
        updatedAt: Timestamp.now()
      });
    } else {
      // sell
      if (transaction.quantity > holding.quantity) {
        throw new Error('Cannot sell more than available quantity');
      }

      const newQuantity = holding.quantity - transaction.quantity;
      
      t.update(holdingRef, {
        quantity: newQuantity,
        // avgCost remains unchanged on partial sell.
        // if quantity reaches 0, we can leave avgCost or reset it, keeping it is fine.
        updatedAt: Timestamp.now()
      });
    }

    t.set(txRef, {
      ...transaction,
      holdingId,
    });
  });
};
