/**
 * Defines the structure for documents in the top-level 'posts' collection.
 * This model represents individual social media posts fetched for analysis.
 * It includes references back to the user and account, platform details,
 * content, metrics, and potential AI insights.
 */
import { Timestamp } from 'firebase/firestore';
import { SocialPlatform } from './socialAccount.model'; // Reusing the platform type.

// Defines the structure for the latest performance metrics snapshot for a post.
interface PostMetrics {
  likes: number;
  comments: number;
  shares?: number | null; // Platform dependent.
  views?: number | null; // Platform dependent.
  engagementRate?: number | null; // Calculated engagement rate (platform specific formula).
  fetchedAt: Timestamp; // When these metrics were last updated.
}

// Defines the structure for AI-generated insights related to a post (Future - Priority 4).
interface PostAiInsights {
  sentiment?: 'positive' | 'negative' | 'neutral' | string | null; // Allow string for flexibility if AI returns custom values.
  suggestions?: string[] | null;
  processedAt: Timestamp;
}

// Defines the main Post interface.
export interface Post {
  userId: string; // Reference back to the owner user (/users/{userId}). Required for filtering.
  accountId: string; // Reference back to the specific social account (/users/{userId}/socialAccounts/{accountId}).
  platform: SocialPlatform; // Denormalized platform identifier for easier querying.
  platformPostId: string; // The unique ID of the post on the original social platform.
  publishedAt: Timestamp; // When the post was originally published on the platform.
  type: 'image' | 'video' | 'text' | 'short' | 'link' | 'carousel' | string; // Type of post. Added string for flexibility.
  textContent?: string | null; // The textual content of the post.
  mediaUrls?: string[] | null; // URLs for associated images/videos.
  permalink?: string | null; // Direct link to the post on the platform.
  latestMetrics?: PostMetrics | null; // Snapshot of the most recent performance metrics.
  aiInsights?: PostAiInsights | null; // Results from AI analysis (Future - Priority 4).
} 