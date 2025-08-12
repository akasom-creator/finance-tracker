import React from 'react';
import Link from 'next/link';
import AuthDetails from './AuthDetails';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          Financial Tracker
        </Link>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link href="/transactions" className="text-gray-300 hover:text-white">
            Transactions
          </Link>
          <Link href="/budget" className="text-gray-300 hover:text-white">
            Budget
          </Link>
          <Link href="/reports" className="text-gray-300 hover:text-white">
            Reports
          </Link>
          <Link href="/login" className="text-gray-300 hover:text-white">
            Login
          </Link>
        </div>
        <AuthDetails />
      </div>
    </nav>
  );
};

export default Navbar;
