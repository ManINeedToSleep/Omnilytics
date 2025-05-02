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