"use client";

import React from 'react';
import { useActivities } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';
import { 
  filterActivitiesByDateRange, 
  getTimeFrameDateRange
} from '@/data-transformers';

/**
 * Cadence Chart component
 * Displays average cadence per activity over time
 */
interface CadenceChartProps {
  timeFrame: string;
}

export function CadenceChart({ timeFrame }: CadenceChartProps) {
  const { data: activities, isLoading, error } = useActivities(timeFrame);

  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run' && activity.average_cadence)
      .map(activity => ({
        date: activity.start_date,
        // Strava API returns cadence as revolutions per minute, multiply by 2 for steps per minute
        cadence: activity.average_cadence * 2,
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
      dataKey="cadence"
      xAxisKey="date"
      name="Average Cadence"
      color="#2196F3"
      yAxisLabel="Steps/min"
      tooltipFormatter={(value) => [`${value.toFixed(0)} spm`, 'Cadence']}
    />
  );
}
