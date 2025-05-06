/**
 * @fileoverview Twitter/X specific analytics page.
 * Displays detailed metrics and charts for connected Twitter/X accounts.
 * Fetches and processes data from Firestore if a Twitter/X account is connected AND user is premium.
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementLineChart from "@/components/charts/EngagementLineChart";
import {
  mockTwitterProfileStats,
  mockTwitterPostData,
  mockTwitterFollowerGrowth,
  type TwitterPostPerformance
} from '@/lib/mockData';
import { CalendarIcon, Twitter as TwitterIcon, Users, BarChart2, Repeat, Heart, MessageCircle, Eye, LinkIcon as ConnectIcon, Zap } from 'lucide-react';

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

interface ProcessedTwitterProfileStats {
  followers: string | number;
  following: string | number;
  tweets: string | number;
  engagementRate: string | number;
  impressions: string | number;
}

export default function TwitterAnalyticsPage() {
  const { user: authUser } = useAuthStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 28)),
    to: new Date(),
  });

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedTwitterAccount, setConnectedTwitterAccount] = useState<SocialAccount & {id: string} | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean | null>(null);

  const [profileStats, setProfileStats] = useState<ProcessedTwitterProfileStats>(mockTwitterProfileStats);
  const [tweetData, setTweetData] = useState<TwitterPostPerformance[]>(mockTwitterPostData);
  const [followerGrowthData, setFollowerGrowthData] = useState<EngagementData[]>(mockTwitterFollowerGrowth);

  const processAndSetData = useCallback((account: SocialAccount | null, timeSeries: AnalyticsTimeSeries[], posts: Post[]) => {
    if (!account) {
      setProfileStats(mockTwitterProfileStats);
      setTweetData(mockTwitterPostData);
      setFollowerGrowthData(mockTwitterFollowerGrowth);
      return;
    }
    let latestFollowers = mockTwitterProfileStats.followers;
    if (timeSeries.length > 0) {
      const latestTS = timeSeries.find(ts => ts.metrics.followers !== undefined && ts.metrics.followers !== null);
      if (latestTS) latestFollowers = Number(latestTS.metrics.followers).toLocaleString();
    }
    setProfileStats({
      followers: latestFollowers,
      following: "N/A",
      tweets: "N/A",
      engagementRate: "N/A",
      impressions: "N/A",
    });

    const processedTweets: TwitterPostPerformance[] = posts
      .filter(p => p.platform === 'twitter')
      .map(p => ({
        id: p.platformPostId,
        tweetText: p.textContent || 'Tweet content unavailable',
        impressions: p.latestMetrics?.views || 0, // Twitter sometimes calls impressions 'views'
        engagements: p.latestMetrics?.engagementRate ? (p.latestMetrics.views || 0) * (p.latestMetrics.engagementRate / 100) : 0, // Example calc
        retweets: p.latestMetrics?.shares || 0, // Assuming shares map to retweets
        likes: p.latestMetrics?.likes || 0,
        replies: p.latestMetrics?.comments || 0, // Assuming comments map to replies
        publishedDate: (p.publishedAt as Timestamp)?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      }));
    setTweetData(processedTweets);

    const growthData: EngagementData[] = timeSeries
      .filter(ts => ts.metrics.followers !== null && ts.metrics.followers !== undefined)
      .map(ts => ({
        name: format((ts.timestamp as Timestamp).toDate(), "MMM dd"),
        Followers: ts.metrics.followers as number,
      })).reverse();
    setFollowerGrowthData(growthData.length > 0 ? growthData : mockTwitterFollowerGrowth);
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      if (!authUser) {
        setIsLoadingPage(false);
        setConnectedTwitterAccount(null);
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
          setConnectedTwitterAccount(null);
          processAndSetData(null, [], []);
          setIsLoadingPage(false);
          return;
        }

        const accountsColRef = collection(db, 'users', authUser.uid, 'socialAccounts');
        const q = query(accountsColRef, where("platform", "==", "twitter"), limit(1));
        const accountsSnapshot = await getDocs(q);

        if (accountsSnapshot.empty) {
          setConnectedTwitterAccount(null);
          processAndSetData(null, [], []);
          setIsLoadingPage(false);
          return;
        }
        const twAccount = { id: accountsSnapshot.docs[0].id, ...accountsSnapshot.docs[0].data() } as SocialAccount & {id: string};
        setConnectedTwitterAccount(twAccount);

        const timeSeriesQuery = query(
            collection(db, 'users', authUser.uid, 'socialAccounts', twAccount.id, 'analyticsTimeSeries'),
            orderBy('timestamp', 'desc'),
        );
        const timeSeriesSnapshot = await getDocs(timeSeriesQuery);
        const timeSeriesData = timeSeriesSnapshot.docs.map(doc => doc.data() as AnalyticsTimeSeries);

        const postsQuery = query(
            collection(db, 'posts'), 
            where("userId", "==", authUser.uid),
            where("accountId", "==", twAccount.id),
            orderBy("publishedAt", "desc"),
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => doc.data() as Post);
        
        processAndSetData(twAccount, timeSeriesData, postsData);

      } catch (err: unknown) {
        console.error("Error fetching Twitter/X page data:", err);
        setError(err instanceof Error ? err.message : "Failed to load Twitter/X data.");
        processAndSetData(null, [], []);
      } finally {
        setIsLoadingPage(false);
      }
    };
    loadPageData();
  }, [authUser, dateRange, processAndSetData]);

  if (isLoadingPage) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500 dark:text-gray-400">Loading Twitter/X Analytics...</p></div>;
  }

  if (!isPremiumUser) {
    return (
      <DashboardCard className="text-center py-12">
        <Zap className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Premium Feature</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Twitter/X analytics is a premium feature. Please upgrade your plan to access.</p>
        <div className="mt-8">
          <Link
            href="/dashboard/settings?tab=profile"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            View Subscription Options
          </Link>
        </div>
      </DashboardCard>
    );
  }

  if (!connectedTwitterAccount) {
    return (
      <DashboardCard className="text-center py-12">
        <ConnectIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Twitter/X Account Not Connected</h3>
        <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Please connect your Twitter/X account in settings to view analytics.</p>
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
            <TwitterIcon className="h-8 w-8 text-[#1DA1F2]" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Twitter / X Analytics</h1>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Followers</p><p className="mt-1 text-3xl font-semibold">{profileStats.followers}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Following</p><p className="mt-1 text-3xl font-semibold">{profileStats.following}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Tweets</p><p className="mt-1 text-3xl font-semibold">{profileStats.tweets}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Eng. Rate</p><p className="mt-1 text-3xl font-semibold">{profileStats.engagementRate}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p><p className="mt-1 text-3xl font-semibold">{profileStats.impressions}</p></DashboardCard>
      </div>
      
      <DashboardCard title="Follower Growth Over Time" className="h-96">
        <EngagementLineChart data={followerGrowthData} />
      </DashboardCard>

      <DashboardCard title="Top Tweets">
      {tweetData.length > 0 ? (
        <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {tweetData.slice(0, 5).map((tweet) => (
                <li key={tweet.id} className="py-4">
                    <div className="flex space-x-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {tweet.tweetText}
                            </p>
                            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(tweet.publishedDate), "LLL dd, yyyy, HH:mm")}
                            </p>
                        </div>
                        <div className="flex flex-col items-end text-xs space-y-1 flex-shrink-0">
                            <span className="inline-flex items-center font-medium text-gray-700 dark:text-gray-300"><Eye className="mr-1 h-3 w-3" /> {Number(tweet.impressions).toLocaleString()}</span>
                            <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><Heart className="mr-1 h-3 w-3" /> {Number(tweet.likes).toLocaleString()}</span>
                            <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><Repeat className="mr-1 h-3 w-3" /> {Number(tweet.retweets).toLocaleString()}</span>
                            <span className="inline-flex items-center text-gray-500 dark:text-gray-400"><MessageCircle className="mr-1 h-3 w-3" /> {Number(tweet.replies).toLocaleString()}</span>
                        </div>
                    </div>
                </li>
                ))}
            </ul>
        </div>
         ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">No tweet data available for the selected period.</p>
        )}
        {tweetData.length > 5 && (
            <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full">View All Tweets (TODO)</Button>
            </div>
        )}
      </DashboardCard>
    </div>
  );
} 