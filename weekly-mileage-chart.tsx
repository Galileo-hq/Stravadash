"use client";

import React from 'react';
import { useWeeklyMileage } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';

/**
 * Weekly mileage chart component
 * Displays running volume (miles) per week
 */
interface WeeklyMileageChartProps {
  timeFrame: string;
}

export function WeeklyMileageChart({ timeFrame }: WeeklyMileageChartProps) {
  const { data, isLoading, error } = useWeeklyMileage(timeFrame);

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
      data={data || []}
      dataKey="miles"
      name="Weekly Mileage"
      color="#FC4C02"
      yAxisLabel="Miles"
      tooltipFormatter={(value) => [`${value.toFixed(2)} miles`, 'Distance']}
    />
  );
}
