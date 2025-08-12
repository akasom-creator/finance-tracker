"use client";
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'framer-motion';

import { Transaction, Budget } from '@/types';

const DashboardPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAllTransactions([]);
      setBudgets([]);
      return;
    }

    const qRecentTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribeRecentTransactions = onSnapshot(qRecentTransactions, (snapshot) => {
      const transactionsData: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(transactionsData);
    }, (error) => {
      console.error("Error fetching recent transactions:", error);
    });

    // Fetch all transactions for the current year for dashboard calculations
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const qAllTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'), // Add orderBy for consistent querying
      where('createdAt', '>=', startOfYear),
      where('createdAt', '<=', endOfYear)
    );
    const unsubscribeAllTransactions = onSnapshot(qAllTransactions, (snapshot) => {
      const transactionsData: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setAllTransactions(transactionsData);
    }, (error) => {
      console.error("Error fetching all transactions:", error);
    });

    const qBudgets = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
      const budgetsData: Budget[] = [];
      snapshot.forEach((doc) => {
        budgetsData.push({ id: doc.id, ...doc.data() } as Budget);
      });
      setBudgets(budgetsData);
    }, (error) => {
      console.error("Error fetching budgets for dashboard:", error);
    });

    return () => {
      unsubscribeRecentTransactions();
      unsubscribeAllTransactions();
      unsubscribeBudgets();
    };
  }, [user]);

  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const savings = totalIncome - totalExpenses;

  const calculateSpent = (category: string) => {
    return allTransactions
      .filter((t) => t.category === category && t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Income</h2>
          <p className="text-3xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Savings</h2>
          <p className="text-3xl font-bold text-blue-500">${savings.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex justify-between border-b py-2">
                <span>{transaction.description}</span>
                <span className={`${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
          <ul>
            {budgets.map((budget) => {
              const spent = calculateSpent(budget.name);
              return (
                <li key={budget.id} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{budget.name}</span>
                    <span>${spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${spent > budget.budgeted ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${(spent / budget.budgeted) * 100}%` }}
                    ></div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
