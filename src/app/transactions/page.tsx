"use client";
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, deleteDoc, doc } from 'firebase/firestore'; // Added getDocs, startAfter
import { db, auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import TransactionForm from '@/components/TransactionForm';
import { motion } from 'framer-motion';
import { Transaction } from '@/types';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const transactionsPerPage = 10; // Number of transactions per page

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLastVisible(null);
      setLoading(false);
      setHasMore(true);
      return;
    }

    // Initial fetch when user logs in or component mounts
    const fetchInitialTransactions = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(transactionsPerPage)
        );
        const documentSnapshots = await getDocs(q);
        const transactionsData: Transaction[] = [];
        documentSnapshots.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(transactionsData);
        setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        setHasMore(documentSnapshots.docs.length === transactionsPerPage);
      } catch (error) {
        console.error("Error fetching initial transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTransactions();
  }, [user]); // Only re-run when user changes

  const handleLoadMore = async () => {
    if (!user || !hasMore || loading) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(transactionsPerPage)
      );
      const documentSnapshots = await getDocs(q);
      const newTransactions: Transaction[] = [];
      documentSnapshots.forEach((doc) => {
        newTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions((prevTransactions) => [...prevTransactions, ...newTransactions]);
      // BUG FIX: Update pagination state to allow for subsequent "Load More" clicks.
      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setHasMore(documentSnapshots.docs.length === transactionsPerPage);
    } catch (error) {
      // SYNTAX FIX: Use a proper try...catch block for error handling in async functions.
      // The 'q' variable is not available in this scope, but we can log the error itself.
      console.error("Error fetching more transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      // Optimistically update UI
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction: ', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Transactions</h1>
      <TransactionForm />
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left font-semibold">
              <th className="p-2">Date</th>
              <th className="p-2">Description</th>
              <th className="p-2">Category</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t">
                <td className="p-2">{new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}</td>
                <td className="p-2">{transaction.description}</td>
                <td className="p-2">{transaction.category}</td>
                <td className={`p-2 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount.toFixed(2)}
                </td>
                <td className="p-2">
                  {/* TYPE FIX: Ensure transaction.id is not undefined before calling the handler. */}
                  <button
                    onClick={() => transaction.id && handleDeleteTransaction(transaction.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionsPage;