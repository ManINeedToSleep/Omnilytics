'use client'; // Need client component for state

import React, { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// This layout applies to all pages within the /dashboard route
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start open

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen"> {/* Apply flex and bg here */}
      {/* Pass state and potentially toggle func to Sidebar if needed */}
      {/* Apply transition and conditional width/styles */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0`}>
         {/* Render sidebar content only if needed even when collapsed? Or keep structure? */} 
         {/* For now, always render and let width hide it */}
        <Sidebar /> 
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Pass toggle handler to TopBar */}
        <TopBar onToggleSidebar={toggleSidebar} /> 
        <main className="p-4 md:p-8 flex-1">
          {/* Wrap the content area with ProtectedRoute */}
          <ProtectedRoute>
             {children} 
          </ProtectedRoute>
        </main>
      </div>
    </div>
  );
} 