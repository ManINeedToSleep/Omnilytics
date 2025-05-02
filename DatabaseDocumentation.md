# Omnilytics Firestore Database Schema

This document outlines the Firestore database structure for the Omnilytics application, including support for Free and Premium user tiers.

**Last Updated:** YYYY-MM-DD *(Please update this when changes are made)*

---

## 1. `users` Collection

*   **Description:** Stores core user information, subscription details, limits, and links to their related data.
*   **Document ID:** `userId` (Matches Firebase Auth UID).

**Path:** `/users/{userId}`

**Fields:**

| Field                | Type             | Description                                                                  |
|----------------------|------------------|------------------------------------------------------------------------------|
| `email`              | `string`         | User's email address (from Auth). Required for identification.               |
| `displayName`        | `string`         | User's display name (from Auth/Profile). For display purposes.                |
| `photoURL`           | `string` \| `null` | User's avatar URL (from Auth/Social Profile). Optional.                       |
| `createdAt`          | `timestamp`      | Timestamp of the user document's creation (first sign-up/login).            |
| `providers`          | `array<string>`  | List of linked Firebase Auth providers (e.g., `['password', 'google.com']`). |
| `subscriptionTier`   | `string`         | User's current tier: `'free'` or `'premium'`. Defaults to `'free'`.       |
| `subscriptionStatus` | `string` \| `null` | Billing status for premium users: `'active'`, `'cancelled'`, `'past_due'`, etc. (Future - relates to billing integration). |
| `premiumExpiry`      | `timestamp` \| `null` | Expiry date for premium subscription, if applicable (Future).                |
| `accountLimits`      | `map`            | Defines limits based on the user's current tier.                             |
|  `accountLimits.maxInstagram` | `number`        | Max Instagram accounts allowed (e.g., 1 for free, 5 for premium).         |
|  `accountLimits.maxYoutube`   | `number`        | Max YouTube accounts allowed (e.g., 1 for free, 5 for premium).           |
|  `accountLimits.maxLinkedin`  | `number`        | Max LinkedIn accounts allowed (e.g., 0 for free, 5 for premium).          |
|  `accountLimits.maxX`         | `number`        | Max Twitter/X accounts allowed (e.g., 0 for free, 5 for premium).         |
|  `accountLimits.maxTotal`     | `number`        | Max total connected accounts allowed (e.g., 2 for free, 20 for premium).    |
| `dashboardLayout`    | `map` \| `null`     | User's saved dashboard widget layout preferences (Future - Priority 5).       |
| `preferences`        | `map` \| `null`     | Other user preferences, e.g., theme, default date range (Future).            |

**Notes:**
*   `accountLimits` should ideally be set/updated by a secure backend process (e.g., Cloud Function) when the `subscriptionTier` changes or upon subscription events.
*   `subscriptionStatus` and `premiumExpiry` depend on integrating a payment provider (e.g., Stripe).

---

## 2. `socialAccounts` Subcollection

*   **Description:** Stores details about each social media account connected by a specific user.
*   **Path:** `/users/{userId}/socialAccounts/{accountId}` (where `accountId` is an auto-generated Firestore ID).

**Fields:**

| Field                 | Type             | Description                                                                    |
|-----------------------|------------------|--------------------------------------------------------------------------------|
| `platform`            | `string`         | Platform identifier: `'instagram'`, `'youtube'`, `'linkedin'`, `'twitter'`.     |
| `platformUserId`      | `string`         | User's unique ID on that specific platform.                                    |
| `username`            | `string`         | User's handle/name on that platform.                                          |
| `profilePictureUrl`   | `string` \| `null` | User's profile picture URL on that platform. Optional.                         |
| `connectedAt`         | `timestamp`      | Timestamp when the account was linked in Omnilytics.                          |
| `status`              | `string`         | Connection status: `'connected'`, `'disconnected'`, `'needs_reauth'`, `'error'`. |
| `lastSyncedAt`        | `timestamp` \| `null` | Timestamp of the last successful data fetch for this account.                  |
| `accessToken`         | `string`         | **Sensitive:** API Access Token (Should be encrypted or stored securely). Future/Real API. |
| `refreshToken`        | `string` \| `null` | **Sensitive:** API Refresh Token (Should be encrypted or stored securely). Future/Real API. |
| `tokenExpiry`         | `timestamp` \| `null` | Expiry time for the `accessToken`. Future/Real API.                           |

**Notes:**
*   Connection logic must check `users/{userId}.accountLimits` before adding a new document here.
*   Storing API tokens securely is critical and may involve encryption or using secret management services.

---

## 3. `posts` Collection (Top-Level)

*   **Description:** Stores data about individual social media posts fetched for analysis.
*   **Document ID:** `postId` (Auto-generated Firestore ID).

**Path:** `/posts/{postId}`

**Fields:**

| Field             | Type                  | Description                                                                     |
|-------------------|-----------------------|---------------------------------------------------------------------------------|
| `userId`          | `string`              | Reference back to the owner user (`/users/{userId}`). **Required for filtering**. |
| `accountId`       | `string`              | Reference back to the specific social account (`/users/{userId}/socialAccounts/{accountId}`). |
| `platform`        | `string`              | Denormalized platform identifier for easier querying.                             |
| `platformPostId`  | `string`              | The unique ID of the post on the original social platform.                      |
| `publishedAt`     | `timestamp`           | When the post was originally published on the platform.                         |
| `type`            | `string`              | Type of post (e.g., `'image'`, `'video'`, `'text'`, `'short'`, `'link'`, `'carousel'`). |
| `textContent`     | `string` \| `null`      | The textual content of the post.                                                |
| `mediaUrls`       | `array<string>` \| `null`| URLs for associated images/videos.                                            |
| `permalink`       | `string` \| `null`      | Direct link to the post on the platform.                                        |
| `latestMetrics`   | `map` \| `null`        | Snapshot of the most recent performance metrics for the post.                   |
| `latestMetrics.likes`       | `number`             | Likes count.                                                                    |
| `latestMetrics.comments`    | `number`             | Comments count.                                                                 |
| `latestMetrics.shares`      | `number` \| `null`     | Shares count (platform dependent).                                              |
| `latestMetrics.views`       | `number` \| `null`     | Views count (platform dependent).                                               |
| `latestMetrics.engagementRate` | `number` \| `null` | Calculated engagement rate (platform specific formula).                       |
| `latestMetrics.fetchedAt`   | `timestamp`          | When these `latestMetrics` were last updated.                                 |
| `aiInsights`      | `map` \| `null`        | Results from AI analysis (Future - Priority 4).                                 |
| `aiInsights.sentiment` | `string` \| `null` | Sentiment analysis result (`'positive'`, `'negative'`, `'neutral'`).            |
| `aiInsights.suggestions` | `array<string>` \| `null` | AI-generated suggestions (e.g., `["Engage with comments"]`).                    |
| `aiInsights.processedAt` | `timestamp`          | When AI analysis was last performed.                                           |

**Notes:**
*   This collection being top-level allows potential cross-user analysis (with proper security rules) but requires indexing on `userId` and `accountId` for user-specific queries.

---

## 4. `analyticsTimeSeries` Subcollection

*   **Description:** Stores historical, time-based aggregate metrics for each connected social account.
*   **Path:** `/users/{userId}/socialAccounts/{accountId}/analyticsTimeSeries/{timeSeriesId}`
*   **Document ID (`timeSeriesId`):** Auto-generated Firestore ID or potentially a date string (e.g., `'YYYY-MM-DD'`) if storing daily snapshots.

**Fields:**

| Field                    | Type             | Description                                                                    |
|--------------------------|------------------|--------------------------------------------------------------------------------|
| `timestamp`              | `timestamp`      | The specific date/time this data point represents (e.g., end of day/hour).       |
| `platform`               | `string`         | Denormalized platform identifier for convenience.                              |
| `metrics`                | `map`            | The aggregated metrics collected during this time period.                      |
| `metrics.followers`      | `number` \| `null` | Follower count at `timestamp` (for Instagram, Twitter, LinkedIn).             |
| `metrics.subscribers`    | `number` \| `null` | Subscriber count at `timestamp` (for YouTube).                                |
| `metrics.following`      | `number` \| `null` | Following count at `timestamp` (Platform dependent).                          |
| `metrics.views`          | `number` \| `null` | Total post/video views during the period (Platform dependent).                |
| `metrics.watchTimeHours` | `number` \| `null` | Total watch time during the period (for YouTube).                             |
| `metrics.engagement`     | `number` \| `null` | Sum of engagements (likes, comments, shares, etc.) during the period.        |
| `metrics.impressions`    | `number` \| `null` | Total impressions during the period.                                           |
| `metrics.reach`          | `number` \| `null` | Total reach during the period.                                                 |
| `metrics.profileViews`   | `number` \| `null` | Profile views during the period.                                               |
| `metrics. ...`           | `number` \| `null` | *Add other relevant time-series metrics per platform as needed.*             |

**Notes:**
*   The granularity (`timeSeriesId` and `timestamp`) depends on how often data is fetched and aggregated (e.g., daily, hourly).

--- 