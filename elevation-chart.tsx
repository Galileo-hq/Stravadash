"use client";

import React from 'react';
import { useActivities } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';
import { 
  filterActivitiesByDateRange, 
  getTimeFrameDateRange,
  metersToFeet
} from '@/data-transformers';

/**
 * Elevation Chart component
 * Displays elevation gain per activity over time
 */
interface ElevationChartProps {
  timeFrame: string;
}

export function ElevationChart({ timeFrame }: ElevationChartProps) {
  const { data: activities, isLoading, error } = useActivities(timeFrame);

  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run')
      .map(activity => ({
        date: activity.start_date,
        elevation: metersToFeet(activity.total_elevation_gain),
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
      dataKey="elevation"
      xAxisKey="date"
      name="Elevation Gain"
      color="#8884d8"
      yAxisLabel="Feet"
      tooltipFormatter={(value) => [`${value.toFixed(0)} ft`, 'Elevation Gain']}
    />
  );
}
