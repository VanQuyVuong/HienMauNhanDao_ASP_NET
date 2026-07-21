import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <div className="print:hidden"><Header /></div>
      <main className="flex-1 w-full print:m-0 print:p-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="print:hidden hidden md:block"><Footer /></div>
      <div className="print:hidden md:hidden"><BottomNavigation /></div>
    </div>
  );
}
