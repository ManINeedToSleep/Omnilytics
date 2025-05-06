'use client';

import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase'; // Import db instance
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile, // Needed to set display name during sign up
  signInWithPopup, // Import signInWithPopup
  GoogleAuthProvider, // Import Google provider
  getAdditionalUserInfo, // To check if user is new
  User // Import User type
} from "firebase/auth";
import {
  doc, 
  setDoc, 
  serverTimestamp, // To set createdAt timestamp
  FieldValue, // Import FieldValue for timestamp type
} from "firebase/firestore"; 
import { FirebaseError } from 'firebase/app'; // Import FirebaseError for type checking
import { useRouter } from 'next/navigation'; // Import useRouter
// TODO: Import icons for social logins (e.g., react-icons)

// Define type for User document data
interface UserDocumentData {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providers: string[];
  lastLoginAt: FieldValue;
  createdAt?: FieldValue; // Optional because only set for new users
  subscriptionTier?: 'free' | 'premium'; // Optional
  accountLimits?: typeof defaultFreeLimits; // Optional
}

// Define default limits for the free tier
const defaultFreeLimits = {
  maxInstagram: 1,
  maxYoutube: 1,
  maxLinkedin: 0,
  maxX: 0,
  maxTotal: 2,
};

// Helper function to update/create user document in Firestore
// Accept optional calculatedDisplayName for signup case
const updateUserDocument = async (user: User, isNewUser: boolean, calculatedDisplayName?: string | null) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);

  // Use the calculated name for signup, otherwise use the name from the auth object
  const finalDisplayName = isNewUser ? calculatedDisplayName : user.displayName;

  // Base data updated on every login/signup
  const userData: Partial<UserDocumentData> = {
    email: user.email,
    displayName: finalDisplayName,
    photoURL: user.photoURL,
    providers: user.providerData.map(p => p.providerId), 
    lastLoginAt: serverTimestamp(),
  };

  try {
    if (isNewUser) {
      // Fields only set when the document is first created
      userData.createdAt = serverTimestamp();
      userData.subscriptionTier = 'free';
      userData.accountLimits = defaultFreeLimits;
      
      // Use setDoc without merge for new user to ensure all fields are set
      await setDoc(userRef, userData); 
      console.log("New user document created in Firestore");
    } else {
      // For existing users, merge updates to avoid overwriting subscription/limits etc.
      await setDoc(userRef, userData, { merge: true });
      console.log("User document updated in Firestore");
    }
  } catch (error) {
    console.error("Error updating user document in Firestore:", error);
  }
};

export default function AuthForm() {
  const router = useRouter(); // Initialize router

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState(''); // Consider adding for signup validation
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isLoading to avoid conflict

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    // Reset fields when toggling
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    // setConfirmPassword('');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      console.log(`Google login successful:`, loggedInUser);

      // Update Firestore (pass null for calculatedDisplayName)
      await updateUserDocument(loggedInUser, !!additionalInfo?.isNewUser, null);

      router.push('/dashboard'); 
      // TODO: Potentially save user data to Firestore
    } catch (error) {
      const providerName = 'Google'; // Use string for error message
      console.error(`${providerName} login error:`, error);
      let friendlyMessage = `Failed to login with ${providerName}. Please try again.`;
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
             friendlyMessage = `An account already exists...`; break;
          case 'auth/popup-closed-by-user':
             friendlyMessage = `Login cancelled...`; break;
          case 'auth/cancelled-popup-request':
             friendlyMessage = 'Login cancelled...'; break;
           case 'auth/popup-blocked':
             friendlyMessage = `Login failed. Please allow popups...`; break;
        }
      }
      setError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true); // Use isSubmitting

    // Optional: Add password confirmation check for sign up
    // if (!isLoginMode && password !== confirmPassword) {
    //   setError("Passwords do not match.");
    //   setIsSubmitting(false);
    //   return;
    // }

    try {
      if (isLoginMode) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in successfully:", userCredential.user);
        
        // Update Firestore (isNewUser=false, pass null for calculatedDisplayName)
        await updateUserDocument(userCredential.user, false, null);
        
        router.push('/dashboard'); // Explicitly redirect after successful email/pass login
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        console.log("Signed up successfully:", newUser);
        
        const calculatedDisplayName = `${firstName} ${lastName}`.trim();
        try {
          await updateProfile(newUser, { displayName: calculatedDisplayName });
          console.log("User profile updated.");
        } catch (profileError) {
          console.error("Error updating profile: ", profileError);
          // Optional: Show a non-critical error to the user about display name not being set
        }

        // Update Firestore (isNewUser=true, pass calculatedDisplayName)
        await updateUserDocument(newUser, true, calculatedDisplayName);

        router.push('/dashboard'); // Explicitly redirect after successful email/pass sign up
      }
    } catch (error) { // Catch as unknown
      // Handle Firebase Authentication errors
      console.error("Authentication error:", error);
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      
      // Check if it's a FirebaseError before accessing error.code
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential': // Added for more recent Firebase versions
             friendlyMessage = "Invalid email or password.";
            break;
          case 'auth/email-already-in-use':
            friendlyMessage = "This email address is already registered.";
            break;
          case 'auth/weak-password':
            friendlyMessage = "Password should be at least 6 characters long.";
            break;
          case 'auth/invalid-email':
            friendlyMessage = "Please enter a valid email address.";
            break;
          // Add other specific error codes as needed
        }
      } else if (error instanceof Error) {
          // Handle generic errors if needed, though less common here
          friendlyMessage = error.message;
      }

      setError(friendlyMessage);
    } finally {
      setIsSubmitting(false); // Use isSubmitting
    }
  };

  // Back button handler - navigate explicitly to landing page
  const handleBack = () => {
    // router.back(); // Don't use browser history
    router.push('/'); // Go to the landing page
  };

  return (
    // Apply landing page background and center content
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-900 p-4">
      {/* Back Button - Adjusted styling */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-800/50 dark:border-gray-600 px-3 py-1 rounded-lg border border-gray-300 shadow-sm transition-colors"
      >
        &larr; Back
      </button>

      {/* Auth Form Container - Apply card styling from landing page */}
      <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Title - Adjusted styling */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
           Omni<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">lytics</span>
        </h1>
        {/* Header - Adjusted styling */}
        <h2 className="text-lg font-medium text-center text-gray-600 dark:text-gray-300">
          {isLoginMode ? 'Login to your account' : 'Create a new account'}
        </h2>

        {/* Social Logins - Button Styling Update */}
        <div className="flex justify-center space-x-4 pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            {/* TODO: Replace with actual Google Icon component */}
            <svg className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.2 109.8 11.8 244 11.8c72.6 0 134.3 29.5 180.2 77.4L372.4 144.8C342.8 116.8 298.9 98.4 244 98.4c-96.4 0-175.6 79.4-175.6 177.2s79.1 177.2 175.6 177.2c100.4 0 165.6-71.1 170.3-141.2H244v-85.6h244z"></path></svg>
            Sign in with Google
          </button>
        </div>

        {/* Divider - Adjusted Styling */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inputs - Styling Update */}
          {!isLoginMode && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 sr-only">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 sr-only">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Error Display - Styling Update */}
          {error && (
            <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Submit Button - Styling Update */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isSubmitting ? (isLoginMode ? 'Logging in...' : 'Creating account...') : 'Confirm'}
            </button>
          </div>
        </form>

        {/* Mode Toggle Link - Styling Update */}
        <div className="text-sm text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
          >
            {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
} 