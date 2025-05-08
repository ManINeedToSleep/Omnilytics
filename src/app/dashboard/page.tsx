/**
 * @fileoverview Main Dashboard Page component.
 * Displays an overview of analytics, processing data for various charts and stats.
 * Fetches connected account status and prepares for fetching/processing real analytics data.
 * Uses reusable DashboardCard components for layout structure.
 * Connects to:
 *   - src/components/charts/*
 *   - src/lib/mockData.ts
 *   - src/lib/firebase.ts (for fetching connected accounts)
 *   - src/store/authStore.ts (for user ID)
 *   - src/app/dashboard/layout.tsx (parent layout)
 *   - src/components/dashboard/DashboardCard.tsx
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import Functions SDK
import type { SocialPlatform } from "@/lib/models/socialAccount.model";
import EngagementLineChart, { type EngagementData } from "@/components/charts/EngagementLineChart";
import PlatformPieChart from "@/components/charts/PlatformPieChart";
import { mockEngagementData, mockPlatformData, mockStats } from "@/lib/mockData"; // Keep mock data for now
import DashboardCard from '@/components/dashboard/DashboardCard';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { LinkIcon, CalendarIcon, ChevronsUpDown } from "lucide-react";
import { format, differenceInDays, endOfMonth, eachDayOfInterval, subDays, startOfWeek, endOfWeek, startOfMonth, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Define structure for processed stats
interface ProcessedStats {
  totalFollowers: string | number;
  impressions: string | number;
  topContentTitle: string;
  newFollowers: string;
}

// Define structure for AI Insights (matching mock function response)
interface AiInsights {
  suggestions: string[];
  overallSentiment: string;
}

// Define platform options based on connected accounts (will be dynamic later)
// For now, using mock data keys + labels
const availablePlatforms: { value: SocialPlatform | 'all', label: string }[] = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter/X' },
];

// Helper function to generate plausible daily mock data within a range
const generateDailyMockData = (
  range: DateRange,
  activePlatforms: string[],
  monthlyMock: EngagementData[]
): EngagementData[] => {
  if (!range.from || !range.to) return [];

  const dailyData: EngagementData[] = [];
  const days = eachDayOfInterval({ start: range.from, end: range.to });
  const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };

  days.forEach(day => {
    const monthIndex = day.getMonth();
    const monthName = Object.keys(monthMap).find(key => monthMap[key] === monthIndex);
    const correspondingMonthData = monthlyMock.find(m => m.name === monthName);
    const daysInMonth = endOfMonth(day).getDate();

    const dailyPoint: EngagementData = { name: format(day, 'MMM dd') };

    activePlatforms.forEach(platform => {
      const monthlyValue = correspondingMonthData?.[platform] as number | undefined;
      if (monthlyValue !== undefined) {
        const baseDailyValue = monthlyValue / daysInMonth;
        const noise = (Math.random() - 0.5) * baseDailyValue * 0.4;
        dailyPoint[platform] = Math.max(0, Math.round(baseDailyValue + noise));
      }
    });
    dailyData.push(dailyPoint);
  });

  return dailyData;
};

export default function DashboardPage() { 
  const { user: authUser } = useAuthStore();
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState<boolean | null>(null); 
  const [isLoading, setIsLoading] = useState(true); // Combined loading state
  
  // State for processed data
  const [processedStats, setProcessedStats] = useState<ProcessedStats>({
      totalFollowers: '0k',
      impressions: '0k',
      topContentTitle: 'N/A',
      newFollowers: '+0'
  }); 
  const [processedLineData, setProcessedLineData] = useState<EngagementData[]>(mockEngagementData); // Use EngagementData[] type
  const [processedPieData, setProcessedPieData] = useState(mockPlatformData); // Init with mock

  // Add state for AI Insights
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // State for filters
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    {
      from: new Date(new Date().setDate(new Date().getDate() - 30)), // Initial default range
      to: new Date(),
    }
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({
    all: true,
    instagram: true,
    youtube: true,
    linkedin: true,
    twitter: true,
  });

  // Processing function - now filters mock data based on selected platforms and date range
  const processAnalyticsData = useCallback(() => {
    console.log("Processing mock data with filters:", selectedRange, selectedPlatforms);
    
    const activePlatforms = availablePlatforms
      .filter(p => p.value !== 'all' && selectedPlatforms[p.value])
      .map(p => p.label);

    let finalLineData: EngagementData[] = [];
    const dailyThreshold = 60;

    if (selectedRange?.from && selectedRange?.to) {
        const diffDays = differenceInDays(selectedRange.to, selectedRange.from);
        if (diffDays <= dailyThreshold) {
            finalLineData = generateDailyMockData(selectedRange, activePlatforms, mockEngagementData);
        } else {
             // Monthly processing (existing logic)
            const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
            const startMonth = selectedRange.from.getMonth();
            const endMonth = selectedRange.to.getMonth();
            const dateFilteredEngagementData = mockEngagementData.filter(point => {
                const monthIndex = monthMap[point.name];
                return monthIndex !== undefined && monthIndex >= startMonth && monthIndex <= endMonth;
            });
            finalLineData = dateFilteredEngagementData.map((timePoint): EngagementData => {
                const filteredPoint: EngagementData = { name: timePoint.name };
                activePlatforms.forEach(platformLabel => {
                    if (Object.prototype.hasOwnProperty.call(timePoint, platformLabel)) {
                        filteredPoint[platformLabel] = timePoint[platformLabel as keyof typeof timePoint];
                    }
                });
                return filteredPoint;
            });
        }
    } else {
        // Default to all monthly data if no range selected (or only one date)
        finalLineData = mockEngagementData.map((timePoint): EngagementData => {
             const filteredPoint: EngagementData = { name: timePoint.name };
             activePlatforms.forEach(platformLabel => {
                 if (Object.prototype.hasOwnProperty.call(timePoint, platformLabel)) {
                     filteredPoint[platformLabel] = timePoint[platformLabel as keyof typeof timePoint];
                 }
             });
             return filteredPoint;
         });
    }

    setProcessedLineData(finalLineData);

    // --- Filter Pie Chart Data (remains the same) ---
    const filteredPieData = mockPlatformData.filter(platformData => 
        activePlatforms.includes(platformData.name)
    );
    setProcessedPieData(filteredPieData);

    // --- Adjust Stats --- 
    // Keep Total Followers calculation based on mock pie data for now
    let filteredFollowers = 0;
    filteredPieData.forEach(p => {
        filteredFollowers += p.value * 27.5; 
    });
    const formatK = (num: number) => (num / 1000).toFixed(1) + 'k';
    
    // Set static mock values for the other cards until real data pipeline is built
    setProcessedStats({
        totalFollowers: formatK(filteredFollowers), // Keep mock calculation for this
        impressions: '152.3k', // Static mock value
        topContentTitle: 'How to Use Our New Feature', // Static mock value
        newFollowers: '+1.2k', // Static mock value
    });

  }, [selectedRange, selectedPlatforms]); // Update dependency array

  // Effect for initial account check and data load
  useEffect(() => {
    const checkAccountsAndLoadData = async () => {
      if (!authUser) {
        setHasConnectedAccounts(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const accountsQuery = query(collection(db, 'users', authUser.uid, 'socialAccounts'), limit(1));
        const accountsSnapshot = await getDocs(accountsQuery);
        const hasAccounts = !accountsSnapshot.empty;
        setHasConnectedAccounts(hasAccounts);

        if (hasAccounts) {
          // Initial data processing after confirming accounts
          processAnalyticsData(); 
          
          // Fetch AI Insights
          setIsLoadingInsights(true);
          setInsightsError(null);
          try {
            const functionsInstance = getFunctions();
            const getInsightsFunc = httpsCallable(functionsInstance, 'getAiInsights');
            console.log("[DASHBOARD] Calling getAiInsights...");
            const result = await getInsightsFunc();
            console.log("[DASHBOARD] getAiInsights returned:", result.data);
            // Type assertion might be needed depending on exact function return structure
            const resultData = result.data as { success: boolean; insights: AiInsights; message?: string }; 
            if (resultData.success && resultData.insights) {
              setAiInsights(resultData.insights);
            } else {
              throw new Error(resultData.message || "Failed to get AI insights from function.");
            }
          } catch (error: unknown) {
            console.error("[DASHBOARD] Error fetching AI insights:", error);
            let message = "Could not load AI insights.";
            if (typeof error === 'object' && error !== null && 'message' in error) {
               message += ` Error: ${(error as {message: string}).message}`;
            }
            setInsightsError(message);
            setAiInsights(null);
          } finally {
            setIsLoadingInsights(false);
          }
        }
      } catch (error) {
        console.error("Error checking accounts or processing data:", error);
        setHasConnectedAccounts(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccountsAndLoadData();
  // Removed processAnalyticsData dependency here, only run on authUser change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]); 

  // Effect to re-process data when filters change *after* initial load
  useEffect(() => {
    // Don't run on initial load (handled by the effect above)
    // Only run if accounts exist and loading is finished
    if (!isLoading && hasConnectedAccounts) {
      processAnalyticsData();
    }
  // Depend on filters and the processing function itself
  }, [selectedRange, selectedPlatforms, processAnalyticsData, isLoading, hasConnectedAccounts]); // Update dependency array

  // Handler for platform filter changes
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatforms(prev => {
      const newState = { ...prev };
      if (platform === 'all') {
        const willBeChecked = !prev.all;
        Object.keys(newState).forEach(key => {
          newState[key] = willBeChecked;
        });
      } else {
        newState[platform] = !prev[platform];
        if (!newState[platform]) {
          newState.all = false;
        }
        const allOthersChecked = availablePlatforms
          .filter(p => p.value !== 'all')
          .every(p => newState[p.value]);
        if (allOthersChecked) {
          newState.all = true;
        }
      }
      return newState;
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  // Prompt if no accounts connected
  if (!hasConnectedAccounts) {
    return (
      <DashboardCard className="text-center">
        <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Accounts Connected</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connect your social media accounts to start seeing your analytics.</p>
        <div className="mt-6">
          <Link
            href="/dashboard/settings?tab=accounts"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            Connect Accounts
          </Link>
        </div>
      </DashboardCard>
    );
  }

  // --- Render main dashboard --- //
  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
        {/* --- Filters Implementation --- */}
        <div className="flex flex-wrap items-center gap-2"> 
            {/* Date Range Picker - Render the new component */}
            <DateRangePicker 
              onDateRangeChange={setSelectedRange} 
              // Optionally pass the initial range if needed for consistency, 
              // though the component has its own default.
              // initialDateRange={selectedRange} 
              // Pass className if you need specific styling for the trigger button
              className="h-8" // Example: matching the platform button height
            />
            
            {/* Platform Selector Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed"> {/* Adjusted size & style */} 
                        <span className="mr-2">Platforms</span>
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter Platforms</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={selectedPlatforms.all}
                        onCheckedChange={() => handlePlatformSelect('all')}
                    >
                        All Platforms
                    </DropdownMenuCheckboxItem>
                    {availablePlatforms.filter(p => p.value !== 'all').map((platform) => (
                        <DropdownMenuCheckboxItem
                            key={platform.value}
                            checked={!!selectedPlatforms[platform.value]} // Ensure boolean check
                            onCheckedChange={() => handlePlatformSelect(platform.value)}
                        >
                           {/* TODO: Maybe add platform icons here? */}
                           <span className="ml-2">{platform.label}</span> 
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Stats Row - Use processed state */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Followers</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{processedStats.totalFollowers}</p>
        </DashboardCard>
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Impressions</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{processedStats.impressions}</p>
        </DashboardCard>
        {/* Special card for Top Content - might need different styling later */}
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Highest Performing Content</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white truncate" title={processedStats.topContentTitle}>
            {/* Maybe add a link icon later? */}
            {processedStats.topContentTitle}
          </p>
        </DashboardCard>
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">New Followers (Range)</p>
          {/* Displaying with a plus, assuming positive change for mock */}
          <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">{processedStats.newFollowers}</p>
        </DashboardCard>
      </div>

      {/* Charts Row - Use processed state */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Engagement Over Time" className="lg:col-span-2 h-96">
          <EngagementLineChart data={processedLineData} />
        </DashboardCard>
        <DashboardCard title="Platform Distribution" className="h-96">
          <PlatformPieChart data={processedPieData} />
        </DashboardCard>
      </div>

      {/* Recent Activity/AI Suggestions */} 
      <DashboardCard title="Recent Activity / Suggestions">
         <div className="min-h-[150px]">
            {isLoadingInsights ? (
              <div className="flex items-center justify-center h-full">
                 <p className="text-gray-500 dark:text-gray-400 italic">Loading insights...</p>
              </div>
            ) : insightsError ? (
              <div className="flex items-center justify-center h-full">
                 <p className="text-red-500 dark:text-red-400 italic">{insightsError}</p>
              </div>
            ) : aiInsights && aiInsights.suggestions.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-5 list-disc">
                {aiInsights.suggestions.slice(0, 4).map((suggestion, index) => ( // Show top 4 suggestions
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            ) : (
               <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400 italic">(No suggestions available at the moment)</p>
               </div>
            )}
         </div>
      </DashboardCard>
    </div>
  );
}
