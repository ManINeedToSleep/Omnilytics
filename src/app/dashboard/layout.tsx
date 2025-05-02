/**
 * @fileoverview DashboardLayout component.
 * This component defines the overall structure for all pages within the /dashboard route group.
 * It includes a persistent, overlaying Sidebar, a TopBar, and wraps the main content area with ProtectedRoute
 * to ensure only authenticated users can access dashboard pages. It manages the state for
 * sidebar visibility (open/closed).
 * Connects to:
 *   - src/components/layout/Sidebar.tsx
 *   - src/components/layout/TopBar.tsx
 *   - src/components/auth/ProtectedRoute.tsx
 *   - Child route pages rendered within <main>
 */
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
    // I'm using a richer slate background for dark mode
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Sidebar is now fixed position, controlled by state */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main content area adjusts padding based on sidebar state */}
      {/* Ensuring padding transition works correctly on relevant screen sizes */}
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'pl-0 md:pl-64' : 'pl-0'}`}>
        {/* TopBar remains at the top of the content area */}
        <TopBar onToggleSidebar={toggleSidebar} />
        <main className="p-6 md:p-8 flex-1">
          <ProtectedRoute>
             {children}
          </ProtectedRoute>
        </main>
      </div>
    </div>
  );
} 