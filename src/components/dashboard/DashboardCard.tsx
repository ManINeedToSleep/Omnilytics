/**
 * @fileoverview DashboardCard component.
 * A reusable wrapper component to provide consistent styling for dashboard widgets.
 * Includes background, padding, border, shadow, and optional title.
 */
import React from 'react';

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Allow passing additional classes
}

export default function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl p-5 transition-all duration-300 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 truncate">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
} 