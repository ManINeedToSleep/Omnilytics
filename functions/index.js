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

export const fetchInitialYouTubeStats = functions.onCall(
  { region: "us-central1" }, // Specify a region, you can change if needed
  async (request) => { // Removed type annotations from request
    logger.info("fetchInitialYouTubeStats called with data:", request.data);

    const { userId, socialAccountId, accessToken, youtubeChannelId } = request.data;

    // Basic validation
    if (!userId || !socialAccountId || !accessToken || !youtubeChannelId) {
      logger.error("Missing required parameters.");
      throw new functions.HttpsError(
        "invalid-argument",
        "Missing required parameters: userId, socialAccountId, accessToken, youtubeChannelId."
      );
    }

    // Optional: Authentication check (commented out as before)
    // if (!request.auth || request.auth.uid !== userId) {
    //   logger.error("Authentication check failed.");
    //   throw new functions.HttpsError(
    //     "unauthenticated",
    //     "The function must be called while authenticated and for the user's own data."
    //   );
    // }

    const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/channels";

    try {
      logger.info(`Fetching stats for YouTube Channel ID: ${youtubeChannelId}`);
      const response = await axios.get(YOUTUBE_API_URL, {
        params: {
          part: "statistics",
          id: youtubeChannelId,
          access_token: accessToken, // Corrected from access_token_param to access_token
        },
      });

      if (response.data && response.data.items && response.data.items.length > 0) {
        const stats = response.data.items[0].statistics;
        const subscriberCount = stats.subscriberCount ? parseInt(stats.subscriberCount, 10) : 0;

        logger.info(`Fetched subscriber count: ${subscriberCount} for channel ${youtubeChannelId}`);

        const analyticsData = {
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          platform: "youtube",
          metrics: {
            subscribers: subscriberCount,
          },
        };

        const timeSeriesRef = db
          .collection("users")
          .doc(userId)
          .collection("socialAccounts")
          .doc(socialAccountId)
          .collection("analyticsTimeSeries");
        
        await timeSeriesRef.add(analyticsData);
        logger.info(`Successfully wrote initial stats to Firestore for socialAccount ${socialAccountId}`);
        
        return {
          success: true,
          message: "Successfully fetched and stored initial YouTube stats.",
          subscriberCount: subscriberCount,
        };
      } else {
        logger.warn("No items found in YouTube API response for channel:", youtubeChannelId, response.data);
        throw new functions.HttpsError(
          "not-found",
          "No channel statistics found in YouTube API response."
        );
      }
    } catch (error) { // Removed type annotation from error
      logger.error("Error in fetchInitialYouTubeStats:", error);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error) && error.response) {
        logger.error("YouTube API Error Response:", error.response.data);
        errorMessage = `YouTube API error: ${error.response.data?.error?.message || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new functions.HttpsError("internal", errorMessage, error);
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
