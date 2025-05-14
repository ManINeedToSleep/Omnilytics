/**
 * @fileoverview LinkedIn specific analytics page.
 * Displays detailed metrics and charts for connected LinkedIn accounts.
 * Fetches and processes data from Firestore if a LinkedIn account is connected AND user is premium.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementLineChart from "@/components/charts/EngagementLineChart";
import {
  mockLinkedInProfileStats,
  mockLinkedInPostData,
  mockLinkedInConnectionsGrowth,
  type LinkedInPostPerformance
} from '@/lib/mockData';
import { CalendarIcon, Linkedin as LinkedinIcon, Eye, ThumbsUp, MessageSquare, Repeat, LinkIcon as ConnectIcon, Zap } from 'lucide-react';

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
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { User as FirestoreUser } from '@/lib/models/user.model';
import type { SocialAccount } from '@/lib/models/socialAccount.model';
import type { Post } from '@/lib/models/post.model';
import type { AnalyticsTimeSeries } from '@/lib/models/analyticsTimeSeries.model';
import { EngagementData } from '@/components/charts/EngagementLineChart';

interface ProcessedLinkedInProfileStats {
  connections: string | number;
  profileViews: string | number;
  postImpressions: string | number;
  engagementRate: string | number;
}

export default function LinkedInAnalyticsPage() {
  const { user: authUser } = useAuthStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 28)),
    to: new Date(),
  });

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedLinkedInAccount, setConnectedLinkedInAccount] = useState<SocialAccount & {id: string} | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean | null>(null);
  const [profileStats, setProfileStats] = useState<ProcessedLinkedInProfileStats>(mockLinkedInProfileStats);
  const [postData, setPostData] = useState<LinkedInPostPerformance[]>(mockLinkedInPostData);
  const [connectionsGrowthData, setConnectionsGrowthData] = useState<EngagementData[]>(mockLinkedInConnectionsGrowth);

  const processAndSetData = useCallback((account: SocialAccount | null, timeSeries: AnalyticsTimeSeries[], posts: Post[]) => {
    if (!account) {
      setProfileStats(mockLinkedInProfileStats);
      setPostData(mockLinkedInPostData);
      setConnectionsGrowthData(mockLinkedInConnectionsGrowth);
      return;
    }
    let latestConnections = mockLinkedInProfileStats.connections;
    if (timeSeries.length > 0) {
      const latestTS = timeSeries.find(ts => ts.metrics.followers !== undefined && ts.metrics.followers !== null); // LinkedIn uses 'followers' for connections in some contexts
      if (latestTS) latestConnections = Number(latestTS.metrics.followers).toLocaleString();
    }
    setProfileStats({
      connections: latestConnections,
      profileViews: "N/A",
      postImpressions: "N/A",
      engagementRate: "N/A",
    });

    const processedPosts: LinkedInPostPerformance[] = posts
      .filter(p => p.platform === 'linkedin')
      .map(p => ({
        id: p.platformPostId,
        contentSummary: p.textContent?.substring(0, 150) || 'LinkedIn Content',
        type: (p.type as LinkedInPostPerformance['type']) || 'Post',
        impressions: p.latestMetrics?.views || 0, // Or impressions specific metric
        reactions: p.latestMetrics?.likes || 0,
        comments: p.latestMetrics?.comments || 0,
        reposts: p.latestMetrics?.shares || undefined,
        publishedDate: (p.publishedAt as Timestamp)?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        thumbnailUrl: p.mediaUrls?.[0] || undefined,
      }));
    setPostData(processedPosts);

    const growthData: EngagementData[] = timeSeries
      .filter(ts => ts.metrics.followers !== null && ts.metrics.followers !== undefined)
      .map(ts => ({
        name: format((ts.timestamp as Timestamp).toDate(), "MMM dd"),
        Connections: ts.metrics.followers as number, 
      })).reverse();
    setConnectionsGrowthData(growthData.length > 0 ? growthData : mockLinkedInConnectionsGrowth);
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      if (!authUser) {
        setIsLoadingPage(false);
        setConnectedLinkedInAccount(null);
        setIsPremiumUser(false);
        return;
      }
      setIsLoadingPage(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let premium = false;
        if (userDocSnap.exists()) {
          premium = (userDocSnap.data() as FirestoreUser).subscriptionTier === 'premium';
        }
        setIsPremiumUser(premium);

        if (!premium) {
          setConnectedLinkedInAccount(null);
          processAndSetData(null, [], []);
          setIsLoadingPage(false);
          return;
        }

        const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
        const q = query(accountsColRef, where("platform", "==", "linkedin"), limit(1));
        const accountsSnapshot = await getDocs(q);

        if (accountsSnapshot.empty) {
          setConnectedLinkedInAccount(null);
          processAndSetData(null, [], []);
          setIsLoadingPage(false);
          return;
        }
        const liAccount = { id: accountsSnapshot.docs[0].id, ...accountsSnapshot.docs[0].data() } as SocialAccount & {id: string};
        setConnectedLinkedInAccount(liAccount);

        const timeSeriesQuery = query(
            collection(db, 'users', authUser.uid, 'socialAccounts', liAccount.id, 'analyticsTimeSeries'),
            orderBy('timestamp', 'desc'),
        );
        const timeSeriesSnapshot = await getDocs(timeSeriesQuery);
        const timeSeriesData = timeSeriesSnapshot.docs.map(doc => doc.data() as AnalyticsTimeSeries);

        const postsQuery = query(
            collection(db, 'posts'), 
            where("userId", "==", authUser.uid),
            where("accountId", "==", liAccount.id),
            orderBy("publishedAt", "desc"),
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => doc.data() as Post);
        
        processAndSetData(liAccount, timeSeriesData, postsData);

      } catch (err: unknown) {
        console.error("Error fetching LinkedIn page data:", err);
        setError(err instanceof Error ? err.message : "Failed to load LinkedIn data.");
        processAndSetData(null, [], []);
      } finally {
        setIsLoadingPage(false);
      }
    };
    loadPageData();
  }, [authUser, dateRange, processAndSetData]);

  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500 dark:text-gray-400">Loading LinkedIn Analytics...</p></div>;
  }

  if (error) {
    return (
      <DashboardCard className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
      </DashboardCard>
    );
  }

  if (!isPremiumUser) {
    return (
      <DashboardCard className="text-center py-12">
        <Zap className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Premium Feature</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">LinkedIn analytics is a premium feature. Please upgrade your plan to access.</p>
        <div className="mt-8">
          <Link
            href="/dashboard/settings?tab=profile" // Or a dedicated subscription page
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            View Subscription Options
          </Link>
        </div>
      </DashboardCard>
    );
  }

  if (!connectedLinkedInAccount) {
    return (
      <DashboardCard className="text-center py-12">
        <ConnectIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">LinkedIn Account Not Connected</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Please connect your LinkedIn account in settings to view analytics.</p>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <LinkedinIcon className="h-8 w-8 text-[#0A66C2]" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">LinkedIn Analytics</h1>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Connections</p><p className="mt-1 text-3xl font-semibold">{profileStats.connections}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Profile Views</p><p className="mt-1 text-3xl font-semibold">{profileStats.profileViews}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Post Impressions</p><p className="mt-1 text-3xl font-semibold">{profileStats.postImpressions}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Eng. Rate</p><p className="mt-1 text-3xl font-semibold">{profileStats.engagementRate}</p></DashboardCard>
      </div>
      
      <DashboardCard title="Connections Growth Over Time" className="h-96">
        <EngagementLineChart data={connectionsGrowthData} />
      </DashboardCard>

      <DashboardCard title="Top Performing Content">
      {postData.length > 0 ? (
        <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {postData.slice(0, 3).map((post) => (
                <li key={post.id} className="py-4">
                    <div className="flex items-center space-x-4">
                    {post.thumbnailUrl && (
                      <div className="flex-shrink-0">
                          <Image className="h-12 w-16 rounded object-cover" src={post.thumbnailUrl} alt={post.contentSummary.substring(0,20)} width={64} height={48} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                         {post.type}: {post.contentSummary}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        Published: {format(new Date(post.publishedDate), "LLL dd, yyyy")}
                        </p>
                    </div>
                    <div className="flex flex-col items-end text-xs space-y-0.5">
                        <span className="inline-flex items-center font-medium text-gray-700 dark:text-gray-300"><Eye className="mr-1 h-3 w-3" /> {Number(post.impressions).toLocaleString()}</span>
                        <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><ThumbsUp className="mr-1 h-3 w-3" /> {Number(post.reactions).toLocaleString()}</span>
                        <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><MessageSquare className="mr-1 h-3 w-3" /> {Number(post.comments).toLocaleString()}</span>
                        {post.reposts && <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><Repeat className="mr-1 h-3 w-3" /> {Number(post.reposts).toLocaleString()}</span>}
                    </div>
                    </div>
                </li>
                ))}
            </ul>
        </div>
         ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">No content data available for the selected period.</p>
        )}
        {postData.length > 3 && (
            <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full">View All Content (TODO)</Button>
            </div>
        )}
      </DashboardCard>
    </div>
  );
} 