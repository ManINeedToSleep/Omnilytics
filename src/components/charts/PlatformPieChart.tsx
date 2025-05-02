/**
 * @fileoverview PlatformPieChart component using Recharts.
 * Displays the distribution of a metric (e.g., engagement, followers) across different platforms.
 * Uses platform-specific brand colors defined in the data.
 * Connects to:
 *   - Parent components passing platform distribution data.
 *   - recharts library.
 */
'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Interfaces --- //
interface PlatformData {
  name: string; // Platform name (e.g., Instagram)
  value: number; // Metric value for this platform
  fill: string; // Platform-specific color hex code (e.g., #E1306C)
}

interface PlatformPieChartProps {
  data: PlatformData[]; // Expects data array with name, value, and fill
}

// --- Component --- //
export default function PlatformPieChart({ data }: PlatformPieChartProps) {
  // Define tooltip content style for dark mode
  const tooltipStyle = {
    backgroundColor: 'rgba(31, 41, 55, 0.9)', // bg-gray-800 with opacity
    border: '1px solid #4b5563', // border-gray-600
    color: '#d1d5db' // text-gray-300
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%" // Center X
          cy="50%" // Center Y
          labelLine={false}
          // Label rendering (optional, can be complex)
          // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius="80%" // Use percentage for better responsiveness
          innerRadius="30%" // Make it a donut chart
          paddingAngle={3} // Add spacing between segments
          fill="#8884d8" // Default fill (not really used due to Cells)
          dataKey="value"
          stroke="none" // Remove cell borders for a cleaner look
        >
          {/* I'm using the 'fill' property directly from the data object */}
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {/* Dark mode tooltip */}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}/> {/* gray-500/10 */}
        {/* Dark mode legend */}
        <Legend wrapperStyle={{ color: '#d1d5db', fontSize: '12px', paddingTop: '15px' }} /> {/* gray-300 */}
      </PieChart>
    </ResponsiveContainer>
  );
} 