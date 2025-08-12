"use client";

import React, { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('signin');

  return (
    <div className="container mx-auto mt-8">
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 font-bold ${activeTab === 'signin' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={`px-4 py-2 font-bold ${activeTab === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>
      {activeTab === 'signin' ? <SignIn /> : <SignUp />}
    </div>
  );
};

export default LoginPage;
