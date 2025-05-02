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
        {/* Filter Controls - Moved from TopBar */} 
        <div className="flex items-center space-x-2">
            {/* TODO: Replace with actual dropdowns/date pickers */}
            <button className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700">Last 30 Days</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700">All Platforms</button>
        </div>
      </div>

      {/* Common Stats Row - Updated Styling */} 
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Example Stat Card - Apply to others */}
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Followers</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockStats.totalFollowers}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Engagement</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockStats.totalEngagement}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Engagement Rate</p>
          {/* Example conditional color */}
          <p className={`mt-1 text-3xl font-semibold ${mockStats.engagementRate.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{mockStats.engagementRate}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Reach</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockStats.reach}</p>
        </div>
      </div>

      {/* Charts Row - Updated Styling */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 h-96">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Engagement Over Time</h3>
          <EngagementLineChart data={mockEngagementData} />
        </div>
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 h-96">
           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Platform Distribution</h3>
          <PlatformPieChart data={mockPlatformData} />
        </div>
      </div>

      {/* Recent Activity/AI Suggestions - Updated Styling */}
      <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-md rounded-lg p-5 min-h-[200px]">
         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity / Suggestions</h3>
         <p className="text-gray-500 dark:text-gray-400 italic">(Placeholder for activity feed or AI insights)</p>
      </div>
    </div>
  );
}
