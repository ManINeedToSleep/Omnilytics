// Sample time-series data for engagement
export const mockEngagementData = [
  { name: 'Jan', Instagram: 400, YouTube: 240, LinkedIn: 150, Twitter: 200 },
  { name: 'Feb', Instagram: 300, YouTube: 139, LinkedIn: 180, Twitter: 250 },
  { name: 'Mar', Instagram: 980, YouTube: 200, LinkedIn: 220, Twitter: 300 },
  { name: 'Apr', Instagram: 390, YouTube: 278, LinkedIn: 250, Twitter: 280 },
  { name: 'May', Instagram: 480, YouTube: 189, LinkedIn: 280, Twitter: 320 },
  { name: 'Jun', Instagram: 520, YouTube: 239, LinkedIn: 300, Twitter: 350 },
  { name: 'Jul', Instagram: 560, YouTube: 349, LinkedIn: 320, Twitter: 380 },
];

// Defining platform colors here to be used in mock data and potentially elsewhere
export const platformColors = {
  Instagram: '#E1306C',
  YouTube: '#FF0000',
  LinkedIn: '#0A66C2',
  Twitter: '#1DA1F2',
};

// Adding the 'fill' property based on platform name
export const mockPlatformData = [
  { name: 'Instagram', value: 400, fill: platformColors.Instagram },
  { name: 'YouTube', value: 300, fill: platformColors.YouTube },
  { name: 'LinkedIn', value: 200, fill: platformColors.LinkedIn },
  { name: 'Twitter', value: 278, fill: platformColors.Twitter },
];

// Sample data for common stats (can replace placeholders later)
export const mockStats = {
  totalFollowers: '11.0k',
  totalEngagement: '7.8k',
  engagementRate: '+5.2%',
  reach: '95.3k',
};

// --- YouTube Specific Mock Data ---
export const mockYouTubeChannelStats = {
  subscribers: '5.21k',
  totalViews: '1.2M',
  watchTimeHours: '85.7k',
  averageViewDuration: '3:45',
};

export interface YouTubeVideoPerformance {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedDate: string; // e.g., "2023-10-26"
  thumbnailUrl?: string;
}

export const mockYouTubeVideoData: YouTubeVideoPerformance[] = [
  {
    id: 'vid1',
    title: 'My Most Viral Short Ever!',
    views: 1250300,
    likes: 75200,
    comments: 3400,
    publishedDate: '2023-09-15',
    thumbnailUrl: 'https://via.placeholder.com/120x90.png/007bff/ffffff?Text=YT+Vid1'
  },
  {
    id: 'vid2',
    title: 'Unboxing the New Tech Gadget',
    views: 88000,
    likes: 4100,
    comments: 512,
    publishedDate: '2023-10-02',
    thumbnailUrl: 'https://via.placeholder.com/120x90.png/28a745/ffffff?Text=YT+Vid2'
  },
  {
    id: 'vid3',
    title: 'Weekly Q&A - October Edition',
    views: 45000,
    likes: 2200,
    comments: 850,
    publishedDate: '2023-10-20',
    thumbnailUrl: 'https://via.placeholder.com/120x90.png/ffc107/000000?Text=YT+Vid3'
  },
  {
    id: 'vid4',
    title: 'Gaming Highlights: Epic Wins!',
    views: 210000,
    likes: 12000,
    comments: 1200,
    publishedDate: '2023-10-25',
    thumbnailUrl: 'https://via.placeholder.com/120x90.png/dc3545/ffffff?Text=YT+Vid4'
  }
];

// Example: Subscriber Growth (could be part of general time series)
export const mockYouTubeSubscriberGrowth = [
  { name: 'Jan', Subscribers: 2100 },
  { name: 'Feb', Subscribers: 2500 },
  { name: 'Mar', Subscribers: 3100 },
  { name: 'Apr', Subscribers: 3500 },
  { name: 'May', Subscribers: 4200 },
  { name: 'Jun', Subscribers: 4800 },
  { name: 'Jul', Subscribers: 5210 },
];

// --- Instagram Specific Mock Data ---
export const mockInstagramProfileStats = {
  followers: '3.5k',
  following: '500',
  posts: '120',
  engagementRate: '4.5%', // Example: Can be calculated
  reach: '15.2k',
  impressions: '25.6k',
};

export interface InstagramPostPerformance {
  id: string;
  captionSummary: string;
  type: 'Image' | 'Video' | 'Carousel' | 'Reel';
  likes: number;
  comments: number;
  reach?: number;
  impressions?: number;
  saved?: number;
  publishedDate: string;
  thumbnailUrl?: string;
  permalink?: string; // Link to actual post
}

export const mockInstagramPostData: InstagramPostPerformance[] = [
  {
    id: 'ig1',
    captionSummary: 'Throwback to our summer event! ☀️ #TBT',
    type: 'Carousel',
    likes: 450,
    comments: 25,
    reach: 3200,
    impressions: 4500,
    saved: 15,
    publishedDate: '2023-10-22',
    thumbnailUrl: 'https://via.placeholder.com/100x100.png/E1306C/ffffff?Text=IG+Post1'
  },
  {
    id: 'ig2',
    captionSummary: 'New product launch! Check it out in our bio. #NewProduct',
    type: 'Image',
    likes: 820,
    comments: 80,
    reach: 7500,
    impressions: 9200,
    saved: 75,
    publishedDate: '2023-10-28',
    thumbnailUrl: 'https://via.placeholder.com/100x100.png/FD1D1D/ffffff?Text=IG+Post2'
  },
  {
    id: 'ig3',
    captionSummary: 'Quick Reel showing our office tour! 🏢 #OfficeLife',
    type: 'Reel',
    likes: 1200,
    comments: 150,
    reach: 15000,
    impressions: 22000,
    saved: 120,
    publishedDate: '2023-11-01',
    thumbnailUrl: 'https://via.placeholder.com/100x100.png/FCAF45/000000?Text=IG+Reel1'
  }
];

// Example: Follower Growth (could be part of general time series)
export const mockInstagramFollowerGrowth = [
  { name: 'Jan', Followers: 1500 },
  { name: 'Feb', Followers: 1800 },
  { name: 'Mar', Followers: 2200 },
  { name: 'Apr', Followers: 2600 },
  { name: 'May', Followers: 2900 },
  { name: 'Jun', Followers: 3200 },
  { name: 'Jul', Followers: 3500 },
]; 