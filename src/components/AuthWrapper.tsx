'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const protectedRoutes = ['/dashboard', '/transactions', '/budget', '/reports'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (pathname === '/login') {
          router.push('/dashboard');
        }
      } else {
        if (protectedRoutes.includes(pathname)) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, protectedRoutes]);

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ delay: 0.25 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
