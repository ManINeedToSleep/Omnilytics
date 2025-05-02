'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PlatformData {
  name: string;
  value: number;
  fill: string; // Color associated with the platform
}

interface PlatformPieChartProps {
  data: PlatformData[];
}

export default function PlatformPieChart({ data }: PlatformPieChartProps) {
  // Define tooltip content style for dark mode
  const tooltipStyle = {
    backgroundColor: 'rgba(30, 41, 59, 0.9)', // bg-slate-800 with opacity
    border: '1px solid #475569', // border-slate-600
    color: '#cbd5e1' // text-slate-300
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%" // Center X
          cy="50%" // Center Y
          labelLine={false}
          // Example label - adjust styling for dark mode if enabled
          // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius="80%" // Use percentage for better responsiveness
          fill="#8884d8" // Default fill, overridden by Cell
          dataKey="value"
          stroke="#334155" // Add a subtle border matching dark card bg - slate-700
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {/* Dark mode tooltip */}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/> {/* slate-500/10 */}
        {/* Dark mode legend */}
        <Legend wrapperStyle={{ color: '#cbd5e1' }} /> {/* slate-300 */}
      </PieChart>
    </ResponsiveContainer>
  );
} 