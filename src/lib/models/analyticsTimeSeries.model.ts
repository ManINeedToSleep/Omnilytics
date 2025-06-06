/**
 * Defines the structure for documents in the 'analyticsTimeSeries' subcollection.
 * This subcollection resides under `/users/{userId}/socialAccounts/{accountId}/analyticsTimeSeries/{timeSeriesId}`.
 * It stores historical, time-based aggregate metrics for a specific social account,
 * allowing for trend analysis over different periods (e.g., daily, hourly).
 */
import { Timestamp } from 'firebase/firestore';
import { SocialPlatform } from './socialAccount.model'; // Reusing the platform type.

// Defines the structure for the aggregated metrics within a time series data point.
// Includes common metrics across platforms, with specific ones potentially being null.
interface TimeSeriesMetrics {
  followers?: number | null; // Follower count (e.g., Instagram, Twitter, LinkedIn).
  subscribers?: number | null; // Subscriber count (e.g., YouTube) - Represents TOTAL on a given day if available.
  following?: number | null; // Following count (Platform dependent).
  views?: number | null; // Total post/video views during the period.
  watchTimeHours?: number | null; // Total watch time (e.g., YouTube).
  watchTimeMinutes?: number | null; // Watch time in minutes (alternative format).
  engagement?: number | null; // Sum of engagements (likes, comments, shares, etc.).
  impressions?: number | null; // Total impressions.
  reach?: number | null; // Total reach.
  profileViews?: number | null; // Profile views.
  likes?: number | null; // Total likes for all content.
  comments?: number | null; // Total comments for all content.
  shares?: number | null; // Total shares for all content.
  averageViewDuration?: number | null; // Average view duration in seconds.
  
  // YouTube specific daily changes from Analytics API
  subscribersGained?: number | null;
  subscribersLost?: number | null;
  netSubscribers?: number | null; // Calculated as gained - lost, represents daily change.

  // NOTE: Add other relevant time-series metrics per platform as needed here.
  // Consider using a more flexible structure like Record<string, number | null> if metrics vary greatly.
}

// Defines the main AnalyticsTimeSeries interface.
export interface AnalyticsTimeSeries {
  timestamp: Timestamp; // The specific date/time this data point represents (e.g., end of day/hour).
  platform: SocialPlatform; // Denormalized platform identifier for convenience.
  metrics: TimeSeriesMetrics; // The aggregated metrics collected during this time period.
} 