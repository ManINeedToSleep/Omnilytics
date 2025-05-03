/**
 * Defines the structure for documents within the 'socialAccounts' subcollection.
 * This subcollection resides under `/users/{userId}/socialAccounts/{accountId}`.
 * It stores details about each social media account connected by a user,
 * including platform info, credentials (marked for secure handling), and sync status.
 */
import { Timestamp } from 'firebase/firestore';

// Defines the possible platforms a user can connect.
export type SocialPlatform = 'instagram' | 'youtube' | 'linkedin' | 'twitter';

// Defines the connection status of a social account.
export type ConnectionStatus = 'connected' | 'disconnected' | 'needs_reauth' | 'error';

// Defines the SocialAccount interface.
export interface SocialAccount {
  platform: SocialPlatform; // Platform identifier.
  platformUserId: string; // User's unique ID on that specific platform.
  username: string; // User's handle/name on that platform.
  profilePictureUrl?: string | null; // User's profile picture URL on that platform. Optional.
  connectedAt: Timestamp; // Timestamp when the account was linked in Omnilytics.
  status: ConnectionStatus; // Connection status.
  lastSyncedAt?: Timestamp | null; // Timestamp of the last successful data fetch for this account. Optional.

  // Sensitive API tokens - marked as optional for now, as real API integration is future work.
  // IMPORTANT: These should be encrypted or stored securely in a production environment.
  accessToken?: string; // API Access Token.
  refreshToken?: string | null; // API Refresh Token.
  tokenExpiry?: Timestamp | null; // Expiry time for the accessToken.
} 