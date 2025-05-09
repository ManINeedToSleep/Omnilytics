# 🌐 Omnilitycs

## Project Overview
Industry: Marketing/Technology
Developer: ManINeedToSleep
Completion Date: Ongoing (Initial foundation laid Q4 2024 / Q1 2025)
GitHub Repository: [ManINeedToSleep/Omnilytics/](https://github.com/ManINeedToSleep/Omnilytics)github.com
Live Demo: (Planned)

## Business Problem

### Problem Statement
Businesses managing multiple social media accounts face significant challenges monitoring performance across platforms. Marketing teams waste valuable time switching between Instagram, Twitter, Facebook, and LinkedIn dashboards, leading to inefficient workflows and missed insights. Without a consolidated view, it's difficult to compare cross-platform performance and make data-driven content decisions.

### Target Users
- **Social Media Managers**: Professionals managing multiple accounts who need quick insights
- **Marketing Teams**: Team members collaborating on social strategy and content creation
- **Business Owners**: Entrepreneurs who handle their own social presence and need simple analytics
- **Content Creators**: Influencers tracking their growth and engagement metrics

### Current Solutions and Limitations
Most users either rely on native analytics from each platform or use expensive enterprise tools with steep learning curves. Native dashboards don't allow for cross-platform comparison, while enterprise solutions are often financially out of reach for small businesses and independent creators. Free alternatives typically lack real-time data or comprehensive features.

## Solution Overview

### Project Description
Omnilitycs provides a unified interface to track, analyze, and optimize social media performance across Instagram, Twitter/X, Facebook, and LinkedIn. The application aggregates data from these platforms into intuitive visualizations, allowing users to identify trends, compare engagement metrics, and make informed decisions. Additionally, AI-powered suggestions help optimize content strategy based on historical performance.

### Key Features *(Note: Some features are planned or in early stages)*
- **Multi-Platform Analytics**: Connect and monitor all major platforms in one place
- **Real-Time Metrics**: Track follower growth, engagement rates, and content performance live
- **AI Recommendations**: Generate content suggestions and sentiment analysis powered by OpenAI (Planned)
- **Content Creation & Scheduling**: Draft, schedule, and manage posts across platforms (Partially implemented)
- **Interactive Visualizations**: Use dynamic charts to uncover trends and engagement patterns
- **Secure Authentication**: Simple and secure login system (Using Firebase Auth)
- **Customizable Dashboards**: Personalize your analytics experience (Planned)
- **Mobile-Responsive Design**: Fully functional across all devices

### Value Proposition
Unlike platform-specific dashboards that force users to switch contexts or enterprise tools with excessive complexity, Omnilitycs offers an affordable, intuitive solution that consolidates essential metrics in one place. By presenting cross-platform data side-by-side, users can immediately identify which strategies are most effective, saving significant time while improving decision-making.

### AI Implementation
Our dashboard leverages AI through the OpenAI API to analyze engagement patterns and deliver actionable recommendations. The AI component analyzes historical content performance data to suggest optimal posting times, content types, and engagement strategies specific to each platform. This analysis would typically require a data scientist but is now automated and accessible to all users.

### Technology Stack (Updated YYYY-MM-DD)
- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4, shadcn/ui (using Radix UI), clsx, tailwind-merge
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form + Zod (Planned/Partially Implemented)
- **Icons**: Lucide React
- **Date Handling**: date-fns, React Day Picker
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Backend**: Firebase Functions (Planned)
- **AI Services**: OpenAI API (Planned)
- **Deployment**: Vercel

## Technical Implementation

### Current Status (As of YYYY-MM-DD)
- **Foundation**: Project initialized with Next.js 15, React 19, Tailwind CSS 4, shadcn/ui.
- **Firebase Integration**: Firebase SDK configured. Firebase Authentication is set up (Google OAuth working) and Firestore is used for storing user data (`users` collection) and connected account details (`socialAccounts` subcollection). Security rules are in place.
- **Account Connection**: Users can connect their YouTube account via OAuth. The connection flow correctly fetches and stores the specific YouTube Channel ID, Name, and Profile Picture in Firestore, rather than just the Google account details.
- **Backend (Initial)**: A basic Firebase Cloud Function (`fetchInitialYouTubeStats`) written in JavaScript (ES6 modules) has been deployed. This function is triggered *once* after a YouTube account connection. It uses the YouTube Data API to fetch the current subscriber count and writes this initial data point to the `analyticsTimeSeries` subcollection in Firestore.
- **Analytics Display**: The YouTube analytics page (`/dashboard/youtube`) reads data from Firestore. It currently displays the initial subscriber count fetched by the Cloud Function. The main dashboard (`/dashboard`) uses mock data, but the overview cards have been updated to reflect desired metrics (Total Followers, Impressions, Top Content, New Followers) using placeholders.
- **UI Improvements**: Sidebar navigation updated (Analytics removed, Settings/Logout fixed at bottom, mobile close button added). Main dashboard date picker adjusted to display one month.
- **Next Steps**: Building out the backend data pipeline (scheduled Cloud Functions) to periodically fetch and store comprehensive analytics data from platform APIs into Firestore. Implementing actual data fetching and processing logic on the dashboard pages to replace mock data.

### Wireframes & System Architecture
The application follows a modern Next.js architecture with server and client components. Data flows from social media platform APIs through our backend services, which process and normalize the information before storing it in the database (Firestore). The frontend retrieves this data (initially mocked, later via Firebase SDK/Functions) and displays it using React components with Recharts for visualization.

For the MVP, we've implemented a mock data approach that simulates the full system without requiring actual API connections.

### Database Schema
Our planned database structure uses **Firebase Firestore**. See `DatabaseDocumentation.md` for the detailed schema including collections for `users`, `socialAccounts`, `posts`, and `analyticsTimeSeries`.

### Key Components
*(Note: Specific component implementation details are evolving. Below are high-level descriptions)*

- **Dashboard Layout**: The main structure holding various widgets and navigation elements.
- **Analytics Visualizations**: Components utilizing Recharts to display data fetched from Firestore.
- **Account Connection Interface**: UI elements for users to link their social media accounts (will interact with Firebase Auth and Firestore).
- **Content Creation Interface**: A dedicated page (`src/app/dashboard/content/page.tsx`) allowing users to compose posts, select platforms, upload media (placeholder), and schedule (placeholder). Uses Zustand for state management locally.
- **Authentication Forms**: Components for handling user sign-up, login, and potentially profile management via Firebase Auth.

#### Dashboard Analytics
*(Placeholder removed - See 'Analytics Visualizations' above)*

#### Social Account Management
*(Placeholder removed - See 'Account Connection Interface' above)*

### Security Implementation Details
- **Authentication**: User authentication is handled by **Firebase Authentication**, supporting Google OAuth initially. User sessions are managed client-side (e.g., via Zustand store) and route protection is enforced using the `<ProtectedRoute>` component.
- **Authorization**: Access to user-specific data stored in Firestore is controlled by **Firestore Security Rules**. The rules enforce that users can only read/write their own data (e.g., their user profile, their connected social accounts, their posts, their analytics time series). Backend functions (like `fetchInitialYouTubeStats`) use Firebase Admin SDK for privileged access when needed.
- **API Keys**: Frontend Firebase configuration keys are stored in environment variables prefixed with `NEXT_PUBLIC_`. Sensitive backend API keys (like OpenAI or potentially platform API keys for backend fetches) will be stored as environment variables accessible only by Cloud Functions.
- **Data Handling**: Sensitive data like OAuth access/refresh tokens will eventually need secure handling (e.g., potentially storing refresh tokens server-side only, encryption at rest if required), although the current implementation uses short-lived access tokens passed to the initial Cloud Function.

### Data Visualization Strategy
- **Dashboard Cards**: Key aggregated metrics (Total Followers, Impressions, etc.) are displayed prominently on the main dashboard using reusable `DashboardCard` components (`src/components/dashboard/DashboardCard.tsx`) for quick overview.
- **Charts**: Time-series data (e.g., Engagement Over Time, Subscriber Growth) is visualized using line charts via the **Recharts** library (e.g., `src/components/charts/EngagementLineChart.tsx`). Categorical data (e.g., Platform Distribution) uses pie charts (e.g., `src/components/charts/PlatformPieChart.tsx`).
- **Responsiveness**: Charts and cards are designed to be responsive, adapting to different screen sizes using Tailwind CSS utility classes.

### Data Transformation Methods
- **Current State (MVP / Initial)**: Data displayed on the dashboard is primarily derived from mock data (`src/lib/mockData.ts`) or very limited data fetched directly from Firestore (e.g., the initial subscriber count fetched by `fetchInitialYouTubeStats`). Minimal client-side processing is done to format this data for display (e.g., in `src/app/dashboard/page.tsx` and `src/app/dashboard/youtube/page.tsx`).
- **Planned Future State**: The primary data transformation will occur in **backend Cloud Functions**. These functions will:
    1. Fetch raw data from social media platform APIs (Analytics and Data APIs).
    2. Normalize this data into the consistent schemas defined in `DatabaseDocumentation.md`.
    3. Aggregate data as needed (e.g., calculate daily/weekly totals, engagement rates).
    4. Store the processed, aggregated, and normalized data in Firestore collections (`analyticsTimeSeries`, updating `posts`, potentially user-level aggregate stats).
    5. The frontend application will then primarily read this pre-processed data from Firestore, requiring minimal transformation on the client-side (mostly just formatting for display).

### Authentication and Authorization
Authentication will be handled using **Firebase Authentication**. The initial implementation will focus on email/password and potentially Google OAuth. Firebase Security Rules will be used to protect Firestore data. *(Note: Previous mention of custom auth/NextAuth.js is outdated).*

## User Interface and Experience

### User Journey
1. User arrives at the landing page with product overview
2. User creates an account or logs in with credentials
3. User connects their social media accounts
4. User views the main dashboard with aggregate metrics
5. User explores detailed analytics for specific platforms
6. User receives AI-powered recommendations to improve engagement
7. User monitors social account performance over time

### Key Screens
- **Home Page**: Product introduction and sign-in options
- **Dashboard**: Overview of performance across all connected platforms
- **Analytics**: Detailed metrics with interactive charts and visualizations
- **Content Creation/Scheduling**: Interface for drafting and managing posts (`/dashboard/content`)
- **Social Accounts**: Management interface for platform connections
- **Profile**: User account settings and preferences

### Responsive Design Approach
The application is built with a mobile-first approach using Tailwind CSS. All components adapt seamlessly across device sizes, from mobile phones to desktop monitors. Complex visualizations reconfigure on smaller screens, maintaining functionality while optimizing for available space.

## Deployment

### Environment Variables
*(Note: Review and update required variables based on Firebase integration)*
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID= # Optional

# OPENAI_API_KEY= # Needed later for AI features
# VERCEL_URL= # Optional, Vercel provides system env var

# Old/Potentially Unused:
# MONGODB_URI=
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=
# FACEBOOK_API_KEY=
# TWITTER_API_KEY=
# INSTAGRAM_API_KEY=
# LINKEDIN_API_KEY=
```

### Build and Deployment Process
The application is configured for deployment on Vercel with automatic CI/CD from the GitHub repository. 

4. **Run the development server**
   *(Uses Turbopack for faster local development)*
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) to see the app in action.

*(Note: The previous MVP credentials may not be relevant until Firebase Auth is implemented).*

## Future Enhancements
- Direct integration with social media platform APIs
- AI-powered content creation assistance
- Advanced scheduling and publishing capabilities
- Team collaboration features
- Custom report generation
- Competitive analysis tools

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/social-media-dashboard.git
   cd social-media-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**
   Create a `.env.local` file with the necessary environment variables.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) to see the app in action.

For the MVP version, use the following credentials:
- Email: user@example.com
- Password: password123
