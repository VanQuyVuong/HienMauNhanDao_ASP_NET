import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function UserLayout() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-900">
      <div className="print:hidden"><Header /></div>
      
      <main className="flex-1 w-full print:m-0 print:p-0 pb-16 md:pb-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <div className="print:hidden hidden md:block"><Footer /></div>
      <div className="print:hidden md:hidden"><BottomNavigation /></div>
    </div>
  );
}
