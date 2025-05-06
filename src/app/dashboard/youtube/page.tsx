/**
 * @fileoverview YouTube specific analytics page.
 * Displays detailed metrics and charts for connected YouTube accounts.
 * Placeholder for fetching and displaying real YouTube data.
 * Connects to:
 *   - src/components/dashboard/DashboardCard.tsx
 *   - src/components/charts/EngagementLineChart.tsx (potentially for subscriber growth)
 *   - src/lib/mockData.ts (for YouTube specific mock data)
 *   - Shadcn UI components (Button, Calendar, Popover for date filter)
 *   - lucide-react (icons)
 */
'use client';

import React, { useState, useEffect } from 'react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementLineChart from "@/components/charts/EngagementLineChart";
import {
  mockYouTubeChannelStats,
  mockYouTubeVideoData,
  mockYouTubeSubscriberGrowth,
  type YouTubeVideoPerformance
} from '@/lib/mockData';
import { CalendarIcon, PlayCircle, ThumbsUp, MessageSquare, Eye } from 'lucide-react'; // YouTube related icons

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

// TODO: Fetch actual user's connected YouTube account data

export default function YouTubeAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 28)), // Default: last 28 days for YouTube
    to: new Date(),
  });

  // Placeholder for selected YouTube account if multiple are connected
  // const [selectedAccount, setSelectedAccount] = useState(null);

  // TODO: useEffect to fetch and process data based on selectedAccount and dateRange

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

      {/* Channel Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Subscribers</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockYouTubeChannelStats.subscribers}</p>
        </DashboardCard>
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Views</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockYouTubeChannelStats.totalViews}</p>
        </DashboardCard>
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Watch Time (Hours)</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockYouTubeChannelStats.watchTimeHours}</p>
        </DashboardCard>
        <DashboardCard className="hover:scale-[1.03]">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg. View Duration</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{mockYouTubeChannelStats.averageViewDuration}</p>
        </DashboardCard>
      </div>
      
      {/* Subscriber Growth Chart */}
      <DashboardCard title="Subscriber Growth Over Time" className="h-96">
        {/* TODO: Adapt EngagementLineChart or create a new chart for single metric timeseries */}
        <EngagementLineChart data={mockYouTubeSubscriberGrowth} />
      </DashboardCard>

      {/* Top Videos List */}
      <DashboardCard title="Top Performing Videos">
        <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {mockYouTubeVideoData.slice(0, 5).map((video) => (
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
        {mockYouTubeVideoData.length > 5 && (
            <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full">View All Videos (TODO)</Button>
            </div>
        )}
      </DashboardCard>
    </div>
  );
}
