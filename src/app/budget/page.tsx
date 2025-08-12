"use client";
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import BudgetForm from '@/components/BudgetForm';
import { motion } from 'framer-motion';
import { Budget, Transaction } from '../../types';





const BudgetPage = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setBudgets([]); // Clear budgets if user logs out
      setTransactions([]); // Clear transactions if user logs out
      return;
    }

    const qBudgets = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
      const budgetsData: Budget[] = [];
      snapshot.forEach((doc) => {
        budgetsData.push({ id: doc.id, ...doc.data() } as Budget);
      });
      setBudgets(budgetsData);
    }, (error) => {
      console.error("Error fetching budgets:", error);
    });

    // Fetch transactions for the current year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const qTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', startOfYear),
      where('createdAt', '<=', endOfYear)
    );
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const transactionsData: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(transactionsData);
    }, (error) => {
      console.error("Error fetching transactions for budget:", error);
    });

    return () => {
      unsubscribeBudgets();
      unsubscribeTransactions();
    };
  }, [user]);

  const calculateSpent = (category: string) => {
    return transactions
      .filter((t) => t.category === category && t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      console.error('Error deleting budget: ', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Budget</h1>
      <BudgetForm />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {budgets.map((budget) => {
          const spent = calculateSpent(budget.name);
          return (
            <div key={budget.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{budget.name}</h2>
                <span className={`px-2 py-1 rounded-full text-sm ${spent > budget.budgeted ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                  {spent > budget.budgeted ? 'Over Budget' : 'Under Budget'}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Spent</span>
                  <span>${spent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budgeted</span>
                  <span>${budget.budgeted.toFixed(2)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${spent > budget.budgeted ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(spent / budget.budgeted) * 100}%` }}
                ></div>
              </div>
              <button
                onClick={() => handleDeleteBudget(budget.id!)}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BudgetPage;
