/**
 * @fileoverview YouTube specific analytics page.
 * Displays detailed metrics and charts for connected YouTube accounts.
 * Fetches and processes data from Firestore if a YouTube account is connected.
 * Connects to:
 *   - src/components/dashboard/DashboardCard.tsx
 *   - src/components/charts/EngagementLineChart.tsx
 *   - src/lib/mockData.ts (for initial state and fallbacks)
 *   - src/lib/firebase.ts (for Firestore)
 *   - src/store/authStore.ts (for user ID)
 *   - Shadcn UI components & lucide-react icons
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementLineChart from "@/components/charts/EngagementLineChart";
import {
  mockYouTubeChannelStats, // Keep for initial state / structure
  mockYouTubeVideoData,    // Keep for initial state / structure
  mockYouTubeSubscriberGrowth, // Keep for initial state / structure
  type YouTubeVideoPerformance
} from '@/lib/mockData';
import { CalendarIcon, PlayCircle, ThumbsUp, MessageSquare, Eye, LinkIcon as ConnectIcon } from 'lucide-react'; 

import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { SocialAccount } from '@/lib/models/socialAccount.model';
import type { Post } from '@/lib/models/post.model';
import type { AnalyticsTimeSeries } from '@/lib/models/analyticsTimeSeries.model';
import { EngagementData } from '@/components/charts/EngagementLineChart'; // Re-import EngagementData

// Define a type for processed channel stats for clarity
interface ProcessedYouTubeChannelStats {
  subscribers: string | number;
  totalViews: string | number;
  watchTimeHours: string | number;
  averageViewDuration: string | number;
}

export default function YouTubeAnalyticsPage() {
  const { user: authUser } = useAuthStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 28)),
    to: new Date(),
  });

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedYouTubeAccount, setConnectedYouTubeAccount] = useState<SocialAccount & {id: string} | null>(null);

  // State for fetched and processed data
  const [channelStats, setChannelStats] = useState<ProcessedYouTubeChannelStats>(mockYouTubeChannelStats);
  const [videoData, setVideoData] = useState<YouTubeVideoPerformance[]>(mockYouTubeVideoData);
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<EngagementData[]>(mockYouTubeSubscriberGrowth);

  // Data processing and fetching logic
  const processAndSetData = useCallback((account: SocialAccount | null, timeSeries: AnalyticsTimeSeries[], posts: Post[]) => {
    if (!account) {
      // Reset to more appropriate empty/zeroed stats if no account or error
      setChannelStats({
        subscribers: "0",
        totalViews: "0",
        watchTimeHours: "0",
        averageViewDuration: "N/A",
      });
      setVideoData([]); // Empty array for no videos
      setSubscriberGrowthData([]); // Empty array for no growth data
      return;
    }

    // 1. Process Channel Stats
    let latestSubscribersCount: number | null = null;
    let totalViewsCount = 0;
    let totalWatchTimeHours = 0;
    
    const sortedTimeSeries = [...timeSeries].sort((a,b) => (b.timestamp as Timestamp).toMillis() - (a.timestamp as Timestamp).toMillis());

    if (sortedTimeSeries.length > 0) {
        const latestValidTS = sortedTimeSeries.find(ts => ts.metrics.subscribers !== undefined && ts.metrics.subscribers !== null);
        if (latestValidTS) {
            latestSubscribersCount = latestValidTS.metrics.subscribers as number;
        }
        totalWatchTimeHours = sortedTimeSeries.reduce((sum, ts) => sum + (ts.metrics.watchTimeHours || 0), 0);
    }

    posts.forEach(post => {
        if (post.platform === 'youtube' && post.latestMetrics) {
            totalViewsCount += post.latestMetrics.views || 0;
        }
    });

    setChannelStats({
        subscribers: latestSubscribersCount !== null ? latestSubscribersCount.toLocaleString() : "0", // Default to 0 if no data
        totalViews: totalViewsCount > 0 ? (totalViewsCount > 1000000 ? (totalViewsCount/1000000).toFixed(1) + 'M' : (totalViewsCount > 1000 ? (totalViewsCount/1000).toFixed(1) + 'k' : totalViewsCount.toLocaleString())) : "0",
        watchTimeHours: totalWatchTimeHours > 0 ? (totalWatchTimeHours > 1000 ? (totalWatchTimeHours/1000).toFixed(1) + 'k' : totalWatchTimeHours.toFixed(1)) : "0",
        averageViewDuration: "N/A" // Keep N/A as it's not calculated yet
    });

    // 2. Process Video Data (Top 10 by views)
    const processedVideos: YouTubeVideoPerformance[] = posts
        .filter(post => post.platform === 'youtube') 
        .sort((a, b) => (b.latestMetrics?.views || 0) - (a.latestMetrics?.views || 0))
        // .slice(0, 10) // Take top 10 for example
        .map(post => ({
            id: post.platformPostId,
            title: post.textContent?.substring(0, 70) || 'Untitled Video',
            views: post.latestMetrics?.views || 0,
            likes: post.latestMetrics?.likes || 0,
            comments: post.latestMetrics?.comments || 0,
            publishedDate: (post.publishedAt as Timestamp)?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            thumbnailUrl: post.mediaUrls?.[0] || undefined,
        }));
    setVideoData(processedVideos.length > 0 ? processedVideos : []); // Set to empty if no processed videos

    // 3. Process Subscriber Growth Data (Ensure chronological order for chart)
    const growthData: EngagementData[] = timeSeries
        .filter(ts => ts.metrics.subscribers !== null && ts.metrics.subscribers !== undefined)
        .map(ts => ({
            name: format((ts.timestamp as Timestamp).toDate(), "MMM dd"),
            Subscribers: ts.metrics.subscribers as number,
        }))
        .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Ensure chronological order
    setSubscriberGrowthData(growthData.length > 0 ? growthData : []); // Set to empty if no growth data

  // Dependencies: only re-process if the raw data itself changes.
  // Date range filtering for fetching should be handled in the `loadPageData` useEffect.
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      if (!authUser) {
        setIsLoadingPage(false);
        setConnectedYouTubeAccount(null);
        return;
      }
      setIsLoadingPage(true);
      setError(null);
      try {
        // 1. Check for connected YouTube account
        const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
        const q = query(accountsColRef, where("platform", "==", "youtube"), limit(1));
        const accountsSnapshot = await getDocs(q);

        if (accountsSnapshot.empty) {
          setConnectedYouTubeAccount(null);
          processAndSetData(null, [], []); // Clear/reset data
          setIsLoadingPage(false);
          return;
        }
        const ytAccount = { id: accountsSnapshot.docs[0].id, ...accountsSnapshot.docs[0].data() } as SocialAccount & {id: string};
        setConnectedYouTubeAccount(ytAccount);

        // 2. Fetch AnalyticsTimeSeries for this YouTube account (e.g., subscriber data)
        // TODO: Add date range filtering to this query
        const timeSeriesQuery = query(
            collection(db, 'users', authUser.uid, 'socialAccounts', ytAccount.id, 'analyticsTimeSeries'),
            orderBy('timestamp', 'desc'), // Get latest first for stats, then reverse for chart
            // where('metrics.subscribers', '!=', null) // Example: only fetch if subscribers exist
            // limit(100) // Limit data points for now
        );
        const timeSeriesSnapshot = await getDocs(timeSeriesQuery);
        const timeSeriesData = timeSeriesSnapshot.docs.map(doc => doc.data() as AnalyticsTimeSeries);

        // 3. Fetch Posts for this YouTube account
        // TODO: Add date range filtering to this query
        const postsQuery = query(
            collection(db, 'posts'), 
            where("userId", "==", authUser.uid),
            where("accountId", "==", ytAccount.id),
            orderBy("publishedAt", "desc"),
            // limit(20)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => doc.data() as Post);
        
        // 4. Process and set all data
        processAndSetData(ytAccount, timeSeriesData, postsData);

      } catch (err: unknown) {
        console.error("Error fetching YouTube page data:", err);
        setError(err instanceof Error ? err.message : "Failed to load YouTube data.");
        processAndSetData(null, [], []); // Clear/reset data
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadPageData();
  }, [authUser, dateRange, processAndSetData]); // Rerun if user, dateRange, or processing logic changes

  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500 dark:text-gray-400">Loading YouTube Analytics...</p></div>;
  }

  // Display error if any occurred during loading
  if (error) {
    return (
      <DashboardCard className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
      </DashboardCard>
    );
  }

  if (!connectedYouTubeAccount) {
    return (
      <DashboardCard className="text-center py-12">
        <ConnectIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">YouTube Account Not Connected</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Please connect your YouTube account in settings to view analytics.</p>
        <div className="mt-8">
          <Link
            href="/dashboard/settings?tab=accounts"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            Go to Connection Settings
          </Link>
        </div>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: Title & Date Range Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <PlayCircle className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">YouTube Analytics</h1>
        </div>
        <Popover>
            <PopoverTrigger asChild>
            <Button id="date" variant={"outline"} size="sm" className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : format(dateRange.from, "LLL dd, y")) : (<span>Pick a date range</span>)}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
            <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
        </Popover>
      </div>

      {/* Channel Stats Overview - Using fetched data */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Subscribers</p><p className="mt-1 text-3xl font-semibold">{channelStats.subscribers}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p><p className="mt-1 text-3xl font-semibold">{channelStats.totalViews}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Watch Time (Hours)</p><p className="mt-1 text-3xl font-semibold">{channelStats.watchTimeHours}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Avg. View Duration</p><p className="mt-1 text-3xl font-semibold">{channelStats.averageViewDuration}</p></DashboardCard>
      </div>
      
      {/* Subscriber Growth Chart - Using fetched data */}
      <DashboardCard title="Subscriber Growth Over Time" className="h-96">
        <EngagementLineChart data={subscriberGrowthData} />
      </DashboardCard>

      {/* Top Videos List - Using fetched data */}
      <DashboardCard title="Top Performing Videos">
        {videoData.length > 0 ? (
            <div className="flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                    {videoData.slice(0, 5).map((video) => (
                    <li key={video.id} className="py-4">
                        <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-16 rounded object-cover" src={video.thumbnailUrl || 'https://via.placeholder.com/120x90?text=Video'} alt={video.title} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {video.title}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            Published: {format(new Date(video.publishedDate), "LLL dd, yyyy")}
                            </p>
                        </div>
                        <div className="flex flex-col items-end text-xs space-y-0.5">
                            <span className="inline-flex items-center font-medium text-gray-700 dark:text-gray-300"><Eye className="mr-1 h-3 w-3" /> {Number(video.views).toLocaleString()}</span>
                            <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><ThumbsUp className="mr-1 h-3 w-3" /> {Number(video.likes).toLocaleString()}</span>
                            <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><MessageSquare className="mr-1 h-3 w-3" /> {Number(video.comments).toLocaleString()}</span>
                        </div>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">No video data available for the selected period.</p>
        )}
        {videoData.length > 5 && (
            <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full">View All Videos (TODO)</Button>
            </div>
        )}
      </DashboardCard>
    </div>
  );
}
