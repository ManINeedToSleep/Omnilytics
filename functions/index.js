/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin"; // Default import for firebase-admin
import axios from "axios";
import { google } from "googleapis"; // Import googleapis

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// No interface needed in JavaScript
// interface FetchYouTubeStatsData {
//   userId: string;
//   socialAccountId: string;
//   accessToken: string;
//   youtubeChannelId: string;
// }

// Helper to get dates for the last N days
function getPastDateString(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export const fetchInitialYouTubeStats = functions.onCall(
  { region: "us-central1", timeoutSeconds: 300, memory: "512MiB" }, // Increased timeout and memory
  async (request) => {
    logger.info("fetchInitialYouTubeStats called with data:", request.data);

    const { userId, socialAccountId, accessToken, youtubeChannelId } = request.data;

    if (!userId || !socialAccountId || !accessToken || !youtubeChannelId) {
      logger.error("Missing required parameters.");
      throw new functions.HttpsError(
        "invalid-argument",
        "Missing required parameters: userId, socialAccountId, accessToken, youtubeChannelId."
      );
    }

    // Initialize YouTube Analytics API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    // Define the date range for historical data (e.g., last 90 days)
    const endDate = getPastDateString(1); // Yesterday, as today's data might not be finalized
    const startDate = getPastDateString(90); // 90 days ago

    try {
      logger.info(`Fetching YouTube Analytics for channel ${youtubeChannelId} from ${startDate} to ${endDate}`);

      const response = await youtubeAnalytics.reports.query({
        ids: `channel==${youtubeChannelId}`,
        startDate: startDate,
        endDate: endDate,
        metrics: "views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares,subscribersGained,subscribersLost",
        dimensions: "day",
        sort: "day", // Ensure data is chronological
      });

      logger.info("Successfully fetched data from YouTube Analytics API.");
      // logger.debug("Full API Response:", JSON.stringify(response.data, null, 2)); // Be careful with logging full PII

      if (response.data && response.data.rows && response.data.rows.length > 0) {
        const rows = response.data.rows;
        const columnHeaders = response.data.columnHeaders.map(header => header.name);
        
        // Find indices of metrics
        const dateIndex = columnHeaders.indexOf("day");
        const viewsIndex = columnHeaders.indexOf("views");
        const minutesWatchedIndex = columnHeaders.indexOf("estimatedMinutesWatched");
        const avgViewDurationIndex = columnHeaders.indexOf("averageViewDuration");
        const likesIndex = columnHeaders.indexOf("likes");
        const commentsIndex = columnHeaders.indexOf("comments");
        const sharesIndex = columnHeaders.indexOf("shares");
        const subsGainedIndex = columnHeaders.indexOf("subscribersGained");
        const subsLostIndex = columnHeaders.indexOf("subscribersLost");

        if (dateIndex === -1) {
            logger.error("Could not find 'day' in columnHeaders", columnHeaders);
            throw new functions.HttpsError("internal", "YouTube API response missing 'day' column.");
        }

        const batch = db.batch();
        const timeSeriesColRef = db
          .collection("users")
          .doc(userId)
          .collection("socialAccounts")
          .doc(socialAccountId)
          .collection("analyticsTimeSeries");

        let documentsWritten = 0;
        for (const row of rows) {
          const dateString = row[dateIndex];
          const timestamp = admin.firestore.Timestamp.fromDate(new Date(dateString));
          
          // Initialize netSubscribers with subscribersGained
          let netSubscribers = row[subsGainedIndex] !== undefined ? Number(row[subsGainedIndex]) : 0;
          // Subtract subscribersLost if it exists and is defined
          if (row[subsLostIndex] !== undefined) {
            netSubscribers -= Number(row[subsLostIndex]);
          }

          const metricsData = {
            views: row[viewsIndex] !== undefined ? Number(row[viewsIndex]) : null,
            watchTimeMinutes: row[minutesWatchedIndex] !== undefined ? Number(row[minutesWatchedIndex]) : null,
            watchTimeHours: row[minutesWatchedIndex] !== undefined ? Number(row[minutesWatchedIndex]) / 60 : null,
            averageViewDuration: row[avgViewDurationIndex] !== undefined ? Number(row[avgViewDurationIndex]) : null,
            likes: row[likesIndex] !== undefined ? Number(row[likesIndex]) : null,
            comments: row[commentsIndex] !== undefined ? Number(row[commentsIndex]) : null,
            shares: row[sharesIndex] !== undefined ? Number(row[sharesIndex]) : null,
            // Note: 'subscribers' in our model is total subscribers on that day.
            // The API gives subscribersGained/Lost. We'll need another way to get total subscribers for each day.
            // For now, let's store gained/lost, and think about total subscribers later.
            subscribersGained: row[subsGainedIndex] !== undefined ? Number(row[subsGainedIndex]) : null,
            subscribersLost: row[subsLostIndex] !== undefined ? Number(row[subsLostIndex]) : null,
            netSubscribers: netSubscribers // This is daily change, not total
          };
          
          // Filter out null values from metricsData
          const filteredMetrics = Object.entries(metricsData)
            .filter(([_, value]) => value !== null)
            .reduce((obj, [key, value]) => {
              obj[key] = value;
              return obj;
            }, {});


          const dailyAnalyticsData = {
            timestamp: timestamp,
            platform: "youtube",
            metrics: filteredMetrics,
          };

          // Use date string as document ID to prevent duplicates if run multiple times for same period
          const docRef = timeSeriesColRef.doc(dateString); 
          batch.set(docRef, dailyAnalyticsData, { merge: true }); // Merge to update if exists
          documentsWritten++;
        }

        await batch.commit();
        logger.info(`Successfully wrote/updated ${documentsWritten} daily stats to Firestore for socialAccount ${socialAccountId}`);

        return {
          success: true,
          message: `Successfully fetched and stored ${documentsWritten} days of historical YouTube stats.`,
          documentsWritten: documentsWritten
        };

      } else {
        logger.warn("No rows found in YouTube Analytics API response for channel:", youtubeChannelId, "Query from", startDate, "to", endDate);
        // It's not an error if there's no data for a new channel, for example.
        return {
          success: true,
          message: "No historical data found for the given period, or channel is new.",
          documentsWritten: 0
        };
      }
    } catch (error) {
      logger.error("Error in fetchInitialYouTubeStats:", error.message, error.stack);
      let errorMessage = "An unexpected error occurred while fetching YouTube Analytics.";
      if (error.response && error.response.data && error.response.data.error) {
        logger.error("YouTube API Error Response:", JSON.stringify(error.response.data.error));
        errorMessage = `YouTube API error: ${error.response.data.error.message} (Code: ${error.response.data.error.code})`;
         if (error.response.data.error.code === 403) {
             errorMessage += " This might be due to insufficient API quota or incorrect API key/OAuth setup or the YouTube Analytics API not being enabled for the project.";
         }
         if (error.response.data.error.code === 400 && error.response.data.error.message.includes("metrics")) {
            errorMessage += " This might be due to requesting incompatible metrics or dimensions."
         }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error types from googleapis
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          const specificError = error.errors[0];
          errorMessage = `YouTube API Error: ${specificError.message} (Reason: ${specificError.reason}, Domain: ${specificError.domain})`;
          if (specificError.reason === "forbidden" || specificError.reason === "insufficientPermissions") {
            errorMessage += " Please ensure the YouTube Analytics API is enabled in your Google Cloud Console and you have the correct OAuth scopes (yt-analytics.readonly)."
          }
      }

      throw new functions.HttpsError("internal", errorMessage, {
          originalError: error.message, 
          // details: error.response ? error.response.data : null // Avoid logging potentially large objects or PII
      });
    }
  }
);

// --- NEW FUNCTION --- //
// Use ES6 export syntax because package.json has "type": "module"
export const getAiInsights = functions.onCall(
  { region: "us-central1" }, 
  async (request) => {
    // For now, this function doesn't need specific data or authentication checks,
    // but you might add them later (e.g., pass userId, check auth).
    logger.info("getAiInsights called, returning mock data.");

    // Simulate fetching/generating insights
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const mockInsights = {
      suggestions: [
        "Post more videos on Tuesdays for higher engagement.",
        "Try using shorter captions for Instagram posts this week.",
        "Engage with comments within the first hour of posting.",
        "Consider running a poll on Twitter to boost interaction."
      ],
      overallSentiment: "positive", // Could be 'positive', 'neutral', 'negative'
      // Add more mock fields as needed
    };

    try {
      return {
        success: true,
        message: "Mock AI insights fetched successfully.",
        insights: mockInsights,
      };
    } catch (error) {
      logger.error("Error in getAiInsights (mock function):", error);
      // This catch block is mostly for unexpected errors in the mock setup itself
      throw new functions.HttpsError("internal", "Failed to return mock insights.", error);
    }
  }
);
