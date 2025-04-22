"use client";

import React from 'react';
import { useActivities } from '@/lib/api/strava-hooks';
import { MetricChart } from '@/components/metric-chart';
import { 
  filterActivitiesByDateRange, 
  getTimeFrameDateRange
} from '@/lib/api/data-transformers';

/**
 * Heart Rate Chart component
 * Displays average heart rate per activity over time
 */
interface HeartRateChartProps {
  timeFrame: string;
}

export function HeartRateChart({ timeFrame }: HeartRateChartProps) {
  const { data: activities, isLoading, error } = useActivities(timeFrame);

  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run' && activity.has_heartrate)
      .map(activity => ({
        date: activity.start_date,
        heartRate: activity.average_heartrate,
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
      dataKey="heartRate"
      xAxisKey="date"
      name="Average Heart Rate"
      color="#FF5252"
      yAxisLabel="BPM"
      tooltipFormatter={(value) => [`${value.toFixed(0)} bpm`, 'Heart Rate']}
    />
  );
}
