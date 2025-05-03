/**
 * Defines the structure for user documents stored in the Firestore 'users' collection.
 * This model corresponds to the schema defined in DatabaseDocumentation.md.
 * It includes user profile information, subscription tier, account limits, and preferences.
 */
import { Timestamp } from 'firebase/firestore';

// Defines the structure for account limits within the User model.
// These limits control how many social accounts of each type a user can connect based on their tier.
interface AccountLimits {
  maxInstagram: number; // Max Instagram accounts allowed (e.g., 1 for free, 5 for premium).
  maxYoutube: number; // Max YouTube accounts allowed (e.g., 1 for free, 5 for premium).
  maxLinkedin: number; // Max LinkedIn accounts allowed (e.g., 0 for free, 5 for premium).
  maxX: number; // Max Twitter/X accounts allowed (e.g., 0 for free, 5 for premium).
  maxTotal: number; // Max total connected accounts allowed (e.g., 2 for free, 20 for premium).
}

// Defines the main User interface.
export interface User {
  email: string; // User's email address (from Auth). Required for identification.
  displayName: string | null; // User's display name (from Auth/Profile). For display purposes. Optional.
  photoURL?: string | null; // User's avatar URL (from Auth/Social Profile). Optional.
  createdAt: Timestamp; // Timestamp of the user document's creation (first sign-up/login).
  providers: string[]; // List of linked Firebase Auth providers (e.g., ['password', 'google.com']).
  subscriptionTier: 'free' | 'premium'; // User's current tier. Defaults to 'free'.
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | string | null; // Billing status for premium users (Future - relates to billing integration). Optional.
  premiumExpiry?: Timestamp | null; // Expiry date for premium subscription, if applicable (Future). Optional.
  accountLimits: AccountLimits; // Defines limits based on the user's current tier. Set/updated by backend.
  dashboardLayout?: Record<string, unknown> | null; // User's saved dashboard widget layout preferences (Future - Priority 5). Optional.
  preferences?: Record<string, unknown> | null; // Other user preferences, e.g., theme, default date range (Future). Optional.
} 