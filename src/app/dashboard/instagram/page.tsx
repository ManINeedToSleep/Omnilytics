/**
 * @fileoverview Instagram specific analytics page.
 * Displays detailed metrics and charts for connected Instagram accounts.
 * Fetches and processes data from Firestore if an Instagram account is connected.
 * Connects to:
 *   - src/components/dashboard/DashboardCard.tsx
 *   - src/components/charts/EngagementLineChart.tsx (potentially for follower growth)
 *   - src/lib/mockData.ts (for Instagram specific mock data)
 *   - Shadcn UI components (Button, Calendar, Popover for date filter)
 *   - lucide-react (icons)
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementLineChart from "@/components/charts/EngagementLineChart";
import {
  mockInstagramProfileStats,
  mockInstagramPostData,
  mockInstagramFollowerGrowth,
  type InstagramPostPerformance
} from '@/lib/mockData';
import { CalendarIcon, Instagram as InstagramIcon, ThumbsUp, MessageSquare, Eye, Bookmark, LinkIcon as ConnectIcon } from 'lucide-react'; // Instagram related icons

// Shadcn UI imports for Date Picker (similar to main dashboard)
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
import { EngagementData } from '@/components/charts/EngagementLineChart';

interface ProcessedInstagramProfileStats {
  followers: string | number;
  following: string | number;
  posts: string | number;
  engagementRate: string;
  reach: string | number;
  impressions: string | number;
}

export default function InstagramAnalyticsPage() {
  const { user: authUser } = useAuthStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 28)),
    to: new Date(),
  });

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedInstagramAccount, setConnectedInstagramAccount] = useState<SocialAccount & {id: string} | null>(null);

  const [profileStats, setProfileStats] = useState<ProcessedInstagramProfileStats>(mockInstagramProfileStats);
  const [postData, setPostData] = useState<InstagramPostPerformance[]>(mockInstagramPostData);
  const [followerGrowthData, setFollowerGrowthData] = useState<EngagementData[]>(mockInstagramFollowerGrowth);

  const processAndSetData = useCallback((account: SocialAccount | null, timeSeries: AnalyticsTimeSeries[], posts: Post[]) => {
    if (!account) {
      setProfileStats(mockInstagramProfileStats);
      setPostData(mockInstagramPostData);
      setFollowerGrowthData(mockInstagramFollowerGrowth);
      return;
    }

    let latestFollowers = mockInstagramProfileStats.followers;
    if (timeSeries.length > 0) {
      const latestTS = timeSeries.find(ts => ts.metrics.followers !== undefined && ts.metrics.followers !== null);
      if (latestTS) latestFollowers = Number(latestTS.metrics.followers).toLocaleString();
    }
    setProfileStats({
      followers: latestFollowers,
      following: "N/A", // Placeholder
      posts: "N/A",     // Placeholder, would come from posts.length or specific metric
      engagementRate: "N/A",
      reach: "N/A",
      impressions: "N/A",
    });

    const processedPosts: InstagramPostPerformance[] = posts
      .filter(p => p.platform === 'instagram')
      .map(p => ({
        id: p.platformPostId,
        captionSummary: p.textContent?.substring(0, 100) || 'Instagram Post',
        type: (p.type as InstagramPostPerformance['type']) || 'Image',
        likes: p.latestMetrics?.likes || 0,
        comments: p.latestMetrics?.comments || 0,
        impressions: p.latestMetrics?.views || undefined,
        reach: undefined,
        saved: p.latestMetrics?.shares || undefined,
        publishedDate: (p.publishedAt as Timestamp)?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        thumbnailUrl: p.mediaUrls?.[0] || undefined,
        permalink: p.permalink || undefined,
      }));
    setPostData(processedPosts);

    const growthData: EngagementData[] = timeSeries
      .filter(ts => ts.metrics.followers !== null && ts.metrics.followers !== undefined)
      .map(ts => ({
        name: format((ts.timestamp as Timestamp).toDate(), "MMM dd"),
        Followers: ts.metrics.followers as number,
      })).reverse();
    setFollowerGrowthData(growthData.length > 0 ? growthData : mockInstagramFollowerGrowth);
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      if (!authUser) {
        setIsLoadingPage(false);
        setConnectedInstagramAccount(null);
        return;
      }
      setIsLoadingPage(true);
      setError(null);
      try {
        const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
        const q = query(accountsColRef, where("platform", "==", "instagram"), limit(1));
        const accountsSnapshot = await getDocs(q);

        if (accountsSnapshot.empty) {
          setConnectedInstagramAccount(null);
          processAndSetData(null, [], []);
          setIsLoadingPage(false);
          return;
        }
        const igAccount = { id: accountsSnapshot.docs[0].id, ...accountsSnapshot.docs[0].data() } as SocialAccount & {id: string};
        setConnectedInstagramAccount(igAccount);

        const timeSeriesQuery = query(
            collection(db, 'users', authUser.uid, 'socialAccounts', igAccount.id, 'analyticsTimeSeries'),
            orderBy('timestamp', 'desc'),
        );
        const timeSeriesSnapshot = await getDocs(timeSeriesQuery);
        const timeSeriesData = timeSeriesSnapshot.docs.map(doc => doc.data() as AnalyticsTimeSeries);

        const postsQuery = query(
            collection(db, 'posts'), 
            where("userId", "==", authUser.uid),
            where("accountId", "==", igAccount.id),
            orderBy("publishedAt", "desc"),
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => doc.data() as Post);
        
        processAndSetData(igAccount, timeSeriesData, postsData);

      } catch (err: unknown) {
        console.error("Error fetching Instagram page data:", err);
        setError(err instanceof Error ? err.message : "Failed to load Instagram data.");
        processAndSetData(null, [], []);
      } finally {
        setIsLoadingPage(false);
      }
    };
    loadPageData();
  }, [authUser, dateRange, processAndSetData]);

  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500 dark:text-gray-400">Loading Instagram Analytics...</p></div>;
  }

  if (error && !connectedInstagramAccount) {
    return (
      <DashboardCard className="text-center py-12">
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">{error}</p>
        <div className="mt-8">
          <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
        </div>
      </DashboardCard>
    );
  }

  if (!connectedInstagramAccount) {
    return (
      <DashboardCard className="text-center py-12">
        <ConnectIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Instagram Account Not Connected</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Please connect your Instagram account in settings to view analytics.</p>
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
            <InstagramIcon className="h-8 w-8 text-[#E1306C]" /> {/* Instagram brand color */}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Instagram Analytics</h1>
        </div>
        <Popover>
            <PopoverTrigger asChild>
            <Button
                id="date"
                variant={"outline"}
                size="sm"
                className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                dateRange.to ? (
                    <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                ) : (
                    format(dateRange.from, "LLL dd, y")
                )
                ) : (
                <span>Pick a date range</span>
                )}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
            />
            </PopoverContent>
        </Popover>
      </div>

      {/* Display error if one exists and we have a connected account (meaning error is specific to data loading for this account) */}
      {error && connectedInstagramAccount && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Profile Stats Overview */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Followers</p><p className="text-2xl font-semibold">{profileStats.followers}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Following</p><p className="text-2xl font-semibold">{profileStats.following}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Posts</p><p className="text-2xl font-semibold">{profileStats.posts}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Eng. Rate</p><p className="text-2xl font-semibold">{profileStats.engagementRate}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Reach</p><p className="text-2xl font-semibold">{profileStats.reach}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p><p className="text-2xl font-semibold">{profileStats.impressions}</p></DashboardCard>
      </div>
      
      {/* Follower Growth Chart */}
      <DashboardCard title="Follower Growth Over Time" className="h-96">
        <EngagementLineChart data={followerGrowthData} />
      </DashboardCard>

      {/* Top Posts List */}
      <DashboardCard title="Top Performing Posts">
        {postData.length > 0 ? (
          <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {postData.slice(0, 5).map((post) => (
                  <li key={post.id} className="py-4">
                      <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                          <Image className="h-12 w-12 rounded object-cover" src={post.thumbnailUrl || 'https://via.placeholder.com/100x100?text=IG'} alt={post.captionSummary.substring(0,20)} width={48} height={48} />
                      </div>
                      <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                           {post.type}: {post.captionSummary}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          Published: {format(new Date(post.publishedDate), "LLL dd, yyyy")}
                          </p>
                      </div>
                      <div className="flex flex-col items-end text-xs space-y-0.5">
                          <span className="inline-flex items-center font-medium text-gray-700 dark:text-gray-300"><ThumbsUp className="mr-1 h-3 w-3" /> {Number(post.likes).toLocaleString()}</span>
                          <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><MessageSquare className="mr-1 h-3 w-3" /> {Number(post.comments).toLocaleString()}</span>
                          {post.reach && <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><Eye className="mr-1 h-3 w-3" /> {Number(post.reach).toLocaleString()}</span>}
                          {post.saved && <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><Bookmark className="mr-1 h-3 w-3" /> {Number(post.saved).toLocaleString()}</span>}
                      </div>
                      </div>
                  </li>
                  ))}
              </ul>
          </div>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">No post data available for the selected period.</p>
        )}
        {postData.length > 5 && (
            <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full">View All Posts (TODO)</Button>
            </div>
        )}
      </DashboardCard>
    </div>
  );
}
