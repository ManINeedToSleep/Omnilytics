/**
 * @fileoverview Main Dashboard Page component.
 * This is the primary view users see after logging in, displaying an overview of their social media analytics.
 * It aggregates key stats, shows charts for engagement and platform distribution, and provides a space for recent activity or AI insights.
 * It currently uses mock data but is intended to fetch real data via the user's connected accounts.
 * It relies on the DashboardLayout for overall structure and authentication.
 * Connects to:
 *   - src/components/charts/*
 *   - src/lib/mockData.ts (for now)
 *   - src/app/dashboard/layout.tsx (parent layout)
 */
'use client'; // Needs to be client for filter state eventually

import EngagementLineChart from "@/components/charts/EngagementLineChart";
import PlatformPieChart from "@/components/charts/PlatformPieChart";
import { mockEngagementData, mockPlatformData, mockStats } from "@/lib/mockData";
// TODO: Add filter state (useState)

// Note: No need for ProtectedRoute here as the layout handles it.
export default function DashboardPage() { 
  // TODO: Add handlers for filter changes

  return (
    <div className="space-y-8"> {/* Added spacing for content blocks */} 
      {/* Header Row: Title + Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        {/* Upgraded Filter Button Styling */}
        <div className="flex items-center space-x-2">
            {/* TODO: Replace with actual dropdowns/date pickers */}
            {/* Making these look more like interactive filter chips */}
            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150">Last 30 Days</button>
            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-150">All Platforms</button>
        </div>
      </div>

      {/* Common Stats Row - Updated Styling for consistency */}
      {/* Using slate-800 for cards in dark mode for better contrast with slate-900 background */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Example Stat Card - Apply to others */}
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 transition-all duration-300 hover:scale-105">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Followers</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockStats.totalFollowers}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 transition-all duration-300 hover:scale-105">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Engagement</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockStats.totalEngagement}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 transition-all duration-300 hover:scale-105">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Engagement Rate</p>
          {/* Example conditional color */}
          <p className={`mt-1 text-3xl font-semibold ${mockStats.engagementRate.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{mockStats.engagementRate}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 transition-all duration-300 hover:scale-105">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Reach</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockStats.reach}</p>
        </div>
      </div>

      {/* Charts Row - Updated Styling */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 h-96">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Engagement Over Time</h3>
          <EngagementLineChart data={mockEngagementData} />
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 h-96">
           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Platform Distribution</h3>
          <PlatformPieChart data={mockPlatformData} />
        </div>
      </div>

      {/* Recent Activity/AI Suggestions - Updated Styling */}
      <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-lg rounded-xl p-5 min-h-[200px]">
         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity / Suggestions</h3>
         <p className="text-gray-500 dark:text-gray-400 italic">(Placeholder for activity feed or AI insights)</p>
      </div>
    </div>
  );
}
