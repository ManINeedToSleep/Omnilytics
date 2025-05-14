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
import Image from 'next/image';
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // Default to last 30 days (29 days prior + today)
    return { from: startDate, to: endDate };
  });

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedYouTubeAccount, setConnectedYouTubeAccount] = useState<SocialAccount & {id: string} | null>(null);

  // State for fetched and processed data
  const [channelStats, setChannelStats] = useState<ProcessedYouTubeChannelStats>(mockYouTubeChannelStats);
  const [videoData, setVideoData] = useState<YouTubeVideoPerformance[]>(mockYouTubeVideoData);
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<EngagementData[]>(mockYouTubeSubscriberGrowth);

  // Data processing and fetching logic
  const processAndSetData = useCallback((account: SocialAccount & {id: string} | null, timeSeries: AnalyticsTimeSeries[], posts: Post[]) => {
    // Log the raw timeSeries data received from Firestore
    console.log("[YOUTUBE_PAGE] Raw timeSeries (filtered by date range in theory):", 
      timeSeries.map(ts => ({
        metrics: ts.metrics,
        timestamp: ts.timestamp instanceof Timestamp ? 
          ts.timestamp.toDate().toISOString() : ts.timestamp,
        platform: ts.platform,
        // @ts-expect-error - docId is added dynamically for debugging, not part of AnalyticsTimeSeries type
        docId: ts.id // If you pass document ID for debugging
      }))
    );
    console.log("[YOUTUBE_PAGE] Raw posts (filtered by date range in theory):", posts.length);


    if (!account || timeSeries.length === 0) {
      // Reset to more appropriate empty/zeroed stats if no account or no timeSeries data for the period
      setChannelStats({
        subscribers: account?.profileData?.subscriberCount?.toLocaleString() || "0", // Use from account if available
        totalViews: "0",
        watchTimeHours: "0",
        averageViewDuration: "N/A",
      });
      // Keep video data from posts, but it might also be empty if posts are filtered
      const processedVideos: YouTubeVideoPerformance[] = posts
        .filter(post => post.platform === 'youtube')
        .sort((a, b) => (b.latestMetrics?.views || 0) - (a.latestMetrics?.views || 0))
        .map(post => ({
            id: post.platformPostId,
            title: post.textContent?.substring(0, 70) || 'Untitled Video',
            views: post.latestMetrics?.views || 0,
            likes: post.latestMetrics?.likes || 0,
            comments: post.latestMetrics?.comments || 0,
            publishedDate: (post.publishedAt as Timestamp)?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            thumbnailUrl: post.mediaUrls?.[0] || undefined,
        }));
      setVideoData(processedVideos);
      setSubscriberGrowthData([]); // Empty array for no growth data
      return;
    }

    // 1. Process Channel Stats from timeSeries data for the selected date range
    let totalViewsCount = 0;
    let totalWatchTimeMinutes = 0; // Calculate in minutes for precision
    
    timeSeries.forEach(ts => {
      totalViewsCount += ts.metrics.views || 0;
      totalWatchTimeMinutes += ts.metrics.watchTimeMinutes || 0;
      // Note: individual ts.metrics.averageViewDuration is daily avg, not for summing
    });

    const totalWatchTimeHours = totalWatchTimeMinutes / 60;
    const avgViewDurationSecs = totalViewsCount > 0 ? (totalWatchTimeMinutes * 60) / totalViewsCount : 0;

    // Subscriber count: Use the value from the SocialAccount document if available.
    // This value is typically the most recent absolute count.
    // The timeSeries gives daily gains/losses, not daily totals.
    const subscriberStat = account.profileData?.subscriberCount?.toLocaleString() || "N/A";
    // As a fallback or alternative, you could sum `netSubscribers` from timeSeries
    // let netSubscribersChange = timeSeries.reduce((sum, ts) => sum + (ts.metrics.netSubscribers || 0), 0);


    setChannelStats({
        subscribers: subscriberStat,
        totalViews: totalViewsCount > 0 ? (totalViewsCount > 1000000 ? (totalViewsCount/1000000).toFixed(1) + 'M' : (totalViewsCount > 1000 ? (totalViewsCount/1000).toFixed(1) + 'k' : totalViewsCount.toLocaleString())) : "0",
        watchTimeHours: totalWatchTimeHours > 0 ? (totalWatchTimeHours > 1000 ? (totalWatchTimeHours/1000).toFixed(1) + 'k' : totalWatchTimeHours.toFixed(1)) : "0",
        averageViewDuration: avgViewDurationSecs > 0 ? 
            (avgViewDurationSecs > 60 ? 
                `${Math.floor(avgViewDurationSecs / 60)}m ${Math.round(avgViewDurationSecs % 60)}s` : 
                `${Math.round(avgViewDurationSecs)}s` 
            ) : "N/A"
    });

    // 2. Process Video Data (Top 10 by views from posts filtered by date range)
    const processedVideos: YouTubeVideoPerformance[] = posts
        .filter(post => post.platform === 'youtube') 
        .sort((a, b) => (b.latestMetrics?.views || 0) - (a.latestMetrics?.views || 0))
        // .slice(0, 10) // Already sliced in display
        .map(post => ({
            id: post.platformPostId,
            title: post.textContent?.substring(0, 70) || 'Untitled Video',
            views: post.latestMetrics?.views || 0,
            likes: post.latestMetrics?.likes || 0,
            comments: post.latestMetrics?.comments || 0,
            publishedDate: (post.publishedAt as Timestamp)?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            thumbnailUrl: post.mediaUrls?.[0] || undefined,
        }));
    setVideoData(processedVideos.length > 0 ? processedVideos : []);

    // 3. Process Chart Data from timeSeries (ensure chronological order for chart)
    const chartDataInput = [...timeSeries].sort((a,b) => (a.timestamp as Timestamp).toMillis() - (b.timestamp as Timestamp).toMillis());

    const metricsForChart: EngagementData[] = chartDataInput.map(ts => {
        const date = format((ts.timestamp as Timestamp).toDate(), "MMM dd");
        const dataPoint: EngagementData = { name: date };

        if (ts.metrics.views !== undefined && ts.metrics.views !== null) dataPoint.Views = ts.metrics.views;
        if (ts.metrics.watchTimeMinutes !== undefined && ts.metrics.watchTimeMinutes !== null) dataPoint.WatchTimeMins = ts.metrics.watchTimeMinutes;
        if (ts.metrics.likes !== undefined && ts.metrics.likes !== null) dataPoint.Likes = ts.metrics.likes;
        if (ts.metrics.comments !== undefined && ts.metrics.comments !== null) dataPoint.Comments = ts.metrics.comments;
        if (ts.metrics.netSubscribers !== undefined && ts.metrics.netSubscribers !== null) dataPoint.NetSubscribers = ts.metrics.netSubscribers; // Daily change
        if (ts.metrics.subscribersGained !== undefined && ts.metrics.subscribersGained !== null) dataPoint.SubsDisabled = ts.metrics.subscribersGained; // example for chart
        
        return dataPoint;
    });
    setSubscriberGrowthData(metricsForChart.length > 0 ? metricsForChart : []);

  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      if (!authUser || !dateRange || !dateRange.from) { // Ensure dateRange and from date exist
        setIsLoadingPage(false);
        setConnectedYouTubeAccount(null);
        processAndSetData(null, [], []);
        return;
      }
      setIsLoadingPage(true);
      setError(null);
      try {
        const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
        const q = query(accountsColRef, where("platform", "==", "youtube"), limit(1));
        const accountsSnapshot = await getDocs(q);

        if (accountsSnapshot.empty) {
          setConnectedYouTubeAccount(null);
          processAndSetData(null, [], []);
          setIsLoadingPage(false);
          return;
        }
        const ytAccount = { 
            id: accountsSnapshot.docs[0].id, 
            ...accountsSnapshot.docs[0].data() 
        } as SocialAccount & {id: string};
        setConnectedYouTubeAccount(ytAccount);

        // Ensure 'to' date is set for range queries, default to 'from' date if not
        const queryEndDate = dateRange.to ? Timestamp.fromDate(dateRange.to) : Timestamp.fromDate(dateRange.from);
        const queryStartDate = Timestamp.fromDate(dateRange.from);

        // Fetch AnalyticsTimeSeries for this YouTube account, filtered by dateRange
        const timeSeriesColRef = collection(db, 'users', authUser.uid, 'socialAccounts', ytAccount.id, 'analyticsTimeSeries');
        const timeSeriesQueryConstraints = [
            orderBy('timestamp', 'asc'), // Important for chronological processing later if needed
            where('timestamp', '>=', queryStartDate),
            where('timestamp', '<=', queryEndDate)
        ];
        // console.log("[YOUTUBE_PAGE] timeSeriesQuery criteria:", queryStartDate.toDate(), queryEndDate.toDate());
        
        const timeSeriesQ = query(timeSeriesColRef, ...timeSeriesQueryConstraints);
        const timeSeriesSnapshot = await getDocs(timeSeriesQ);
        const timeSeriesData = timeSeriesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as AnalyticsTimeSeries & {id: string}));
        // console.log("[YOUTUBE_PAGE] Fetched timeSeriesData docs:", timeSeriesSnapshot.docs.length);


        // Fetch Posts for this YouTube account, filtered by dateRange
        const postsColRef = collection(db, 'posts');
        const postsQueryConstraints = [
            where("userId", "==", authUser.uid),
            where("accountId", "==", ytAccount.id),
            orderBy("publishedAt", "desc"),
            where("publishedAt", ">=", queryStartDate),
            where("publishedAt", "<=", queryEndDate)
        ];
        // console.log("[YOUTUBE_PAGE] postsQuery criteria:", queryStartDate.toDate(), queryEndDate.toDate());

        const postsQ = query(postsColRef, ...postsQueryConstraints);
        const postsSnapshot = await getDocs(postsQ);
        const postsData = postsSnapshot.docs.map(doc => doc.data() as Post);
        // console.log("[YOUTUBE_PAGE] Fetched postsData docs:", postsSnapshot.docs.length);
        
        processAndSetData(ytAccount, timeSeriesData, postsData);

      } catch (err: unknown) {
        console.error("Error fetching YouTube page data:", err);
        setError(err instanceof Error ? err.message : "Failed to load YouTube data.");
        setConnectedYouTubeAccount(null); // Clear account on error
        processAndSetData(null, [], []);
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
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Total Views (Period)</p><p className="mt-1 text-3xl font-semibold">{channelStats.totalViews}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Watch Time (Hours, Period)</p><p className="mt-1 text-3xl font-semibold">{channelStats.watchTimeHours}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Avg. View Duration (Period)</p><p className="mt-1 text-3xl font-semibold">{channelStats.averageViewDuration}</p></DashboardCard>
      </div>
      
      {/* YouTube Metrics Over Time Chart - Using fetched data */}
      <DashboardCard title="YouTube Metrics Over Time" className="h-96">
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
                            <Image className="h-10 w-16 rounded object-cover" src={video.thumbnailUrl || 'https://via.placeholder.com/120x90?text=Video'} alt={video.title} width={64} height={40} />
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
