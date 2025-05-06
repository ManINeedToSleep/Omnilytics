/**
 * @fileoverview Instagram specific analytics page.
 * Displays detailed metrics and charts for connected Instagram accounts.
 * Placeholder for fetching and displaying real Instagram data.
 * Connects to:
 *   - src/components/dashboard/DashboardCard.tsx
 *   - src/components/charts/EngagementLineChart.tsx (potentially for follower growth)
 *   - src/lib/mockData.ts (for Instagram specific mock data)
 *   - Shadcn UI components (Button, Calendar, Popover for date filter)
 *   - lucide-react (icons)
 */
'use client';

import React, { useState, useEffect } from 'react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementLineChart from "@/components/charts/EngagementLineChart";
import {
  mockInstagramProfileStats,
  mockInstagramPostData,
  mockInstagramFollowerGrowth,
  type InstagramPostPerformance
} from '@/lib/mockData';
import { CalendarIcon, Instagram as InstagramIcon, ThumbsUp, MessageSquare, Eye, Bookmark } from 'lucide-react'; // Instagram related icons

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

// TODO: Fetch actual user's connected Instagram account data

export default function InstagramAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 28)), // Default: last 28 days
    to: new Date(),
  });

  // TODO: useEffect to fetch and process data based on selectedAccount and dateRange

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

      {/* Profile Stats Overview */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Followers</p><p className="text-2xl font-semibold">{mockInstagramProfileStats.followers}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Following</p><p className="text-2xl font-semibold">{mockInstagramProfileStats.following}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Posts</p><p className="text-2xl font-semibold">{mockInstagramProfileStats.posts}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Eng. Rate</p><p className="text-2xl font-semibold">{mockInstagramProfileStats.engagementRate}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Reach</p><p className="text-2xl font-semibold">{mockInstagramProfileStats.reach}</p></DashboardCard>
        <DashboardCard><p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p><p className="text-2xl font-semibold">{mockInstagramProfileStats.impressions}</p></DashboardCard>
      </div>
      
      {/* Follower Growth Chart */}
      <DashboardCard title="Follower Growth Over Time" className="h-96">
        <EngagementLineChart data={mockInstagramFollowerGrowth} />
      </DashboardCard>

      {/* Top Posts List */}
      <DashboardCard title="Top Performing Posts">
        <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {mockInstagramPostData.slice(0, 5).map((post) => (
                <li key={post.id} className="py-4">
                    <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <img className="h-12 w-12 rounded object-cover" src={post.thumbnailUrl || 'https://via.placeholder.com/100x100?text=IG'} alt={post.captionSummary.substring(0,20)} />
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
        {mockInstagramPostData.length > 5 && (
            <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full">View All Posts (TODO)</Button>
            </div>
        )}
      </DashboardCard>
    </div>
  );
}
