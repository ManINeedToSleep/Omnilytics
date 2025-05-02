/**
 * @fileoverview EngagementLineChart component using Recharts.
 * Displays engagement trends over time for multiple platforms.
 * Dynamically determines platforms from data and assigns specific brand colors.
 * Connects to:
 *   - Parent components passing engagement data.
 *   - recharts library.
 */
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Interfaces --- //
interface EngagementData {
  name: string; // Typically the time period (e.g., 'Jan', 'Feb')
  [key: string]: number | string; // Allow dynamic keys for platforms (e.g., Instagram, YouTube)
}

interface EngagementLineChartProps {
  data: EngagementData[];
}

// --- Platform Colors --- //
// I'm defining specific colors for each platform here
const platformColors: { [key: string]: string } = {
  Instagram: '#E1306C', // Instagram Pink/Purple
  YouTube: '#FF0000',   // YouTube Red
  Twitter: '#1DA1F2',   // Twitter Blue
  LinkedIn: '#0A66C2',  // LinkedIn Blue
  Facebook: '#1877F2',  // Facebook Blue
  // Add default/fallback colors if needed
  default: '#8884d8'      // Recharts default purple
};

const getPlatformColor = (platform: string): string => {
  return platformColors[platform] || platformColors.default;
};

// --- Component --- //
export default function EngagementLineChart({ data }: EngagementLineChartProps) {
  // Get platform keys dynamically from the first data point (excluding 'name')
  const platforms = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name') : [];

  // Define tooltip content style for dark mode
  const tooltipStyle = {
      backgroundColor: 'rgba(31, 41, 55, 0.9)', // bg-gray-800 with opacity
      border: '1px solid #4b5563', // border-gray-600
      color: '#d1d5db' // text-gray-300
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 15, // Reduced right margin slightly
          left: -10, // Reduced left margin slightly
          bottom: 5,
        }}
      >
        {/* Dark mode grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" /> {/* gray-600 */}
        {/* Dark mode axes */}
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickMargin={5} /> {/* gray-400 */}
        <YAxis stroke="#9ca3af" fontSize={11} tickMargin={5}/> {/* gray-400 */}
        {/* Dark mode tooltip */}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}/> {/* gray-500/10 */}
        {/* Dark mode legend */}
        <Legend wrapperStyle={{ color: '#d1d5db', fontSize: '12px', paddingTop: '10px' }} /> {/* gray-300 */}
        {/* I'm mapping platforms to their specific colors */}
        {platforms.map((platform) => {
          const color = getPlatformColor(platform);
          return (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              stroke={color}
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0, fill: color }}
              dot={{ r: 3, strokeWidth: 0, fill: color }} // Smaller dots
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
} 