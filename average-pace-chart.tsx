"use client";

import React from 'react';
import { useActivities } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';
import { 
  filterActivitiesByDateRange, 
  getTimeFrameDateRange,
  mpsToMinPerMile,
  formatDuration,
  calculateWeeklyAveragePace
} from '@/data-transformers';

/**
 * Average Pace Chart component
 * Displays average pace per run over time
 */
interface AveragePaceChartProps {
  timeFrame: string;
}

export function AveragePaceChart({ timeFrame }: AveragePaceChartProps) {
  const { data: activities, isLoading, error } = useActivities(timeFrame);

  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run')
      .map(activity => ({
        date: activity.start_date,
        pace: mpsToMinPerMile(activity.average_speed),
        // Convert pace string (MM:SS) to numeric value for charting
        paceValue: activity.average_speed > 0 
          ? (1609.344 / activity.average_speed) / 60 
          : 0,
        name: activity.name,
        distance: activity.distance,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return filteredActivities;
  }, [activities, timeFrame]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        <p className="ml-2 text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-red-500">Error loading data: {error.message}</p>
      </div>
    );
  }

  return (
    <MetricChart
      data={processedData}
      dataKey="paceValue"
      xAxisKey="date"
      name="Average Pace"
      color="#4CAF50"
      yAxisLabel="Minutes per Mile"
      tooltipFormatter={(value) => {
        const minutes = Math.floor(value);
        const seconds = Math.round((value - minutes) * 60);
        return [`${minutes}:${seconds.toString().padStart(2, '0')} min/mile`, 'Pace'];
      }}
    />
  );
}
