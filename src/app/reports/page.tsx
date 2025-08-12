"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'framer-motion';

import { Transaction } from '../../types';

interface ChartData {
  name: string;
  income: number;
  expenses: number;
}

const ReportsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('userId', '!=', null));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactionsData: Transaction[] = [];
        snapshot.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(transactionsData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const monthlyData = transactions.reduce((acc: Record<string, ChartData>, transaction) => {
    const date = new Date(transaction.createdAt.seconds * 1000);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;

    if (!acc[monthYear]) {
      acc[monthYear] = { name: monthYear, income: 0, expenses: 0 };
    }

    if (transaction.type === 'income') {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expenses += transaction.amount;
    }

    return acc;
  }, {});

  const chartData: ChartData[] = Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.name);
    const dateB = new Date(b.name);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Financial Reports</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Income vs. Expenses</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#8884d8" />
            <Bar dataKey="expenses" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ReportsPage;
