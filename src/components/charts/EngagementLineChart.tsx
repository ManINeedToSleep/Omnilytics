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

interface EngagementData {
  name: string;
  [key: string]: number | string; // Allow dynamic keys for platforms
}

interface EngagementLineChartProps {
  data: EngagementData[];
}

export default function EngagementLineChart({ data }: EngagementLineChartProps) {
  // Get platform keys dynamically from the first data point (excluding 'name')
  const platforms = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name') : [];
  // Define some colors or generate them dynamically
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']; 

  // Define tooltip content style for dark mode
  const tooltipStyle = {
      backgroundColor: 'rgba(30, 41, 59, 0.9)', // bg-slate-800 with opacity
      border: '1px solid #475569', // border-slate-600
      color: '#cbd5e1' // text-slate-300
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        {/* Dark mode grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" /> {/* slate-600 */}
        {/* Dark mode axes */}
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} /> {/* slate-400 */}
        <YAxis stroke="#94a3b8" fontSize={12} /> {/* slate-400 */}
        {/* Dark mode tooltip */}
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/> {/* slate-500/10 */}
        {/* Dark mode legend */}
        <Legend wrapperStyle={{ color: '#cbd5e1' }} /> {/* slate-300 */}
        {platforms.map((platform, index) => (
          <Line 
            key={platform}
            type="monotone"
            dataKey={platform}
            stroke={colors[index % colors.length]} // Cycle through colors
            strokeWidth={2}
            activeDot={{ r: 6, strokeWidth: 0, fill: colors[index % colors.length] }}
            dot={{ r: 3, strokeWidth: 0, fill: colors[index % colors.length] }} // Smaller dots
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
} 