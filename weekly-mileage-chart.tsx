"use client";

import React from 'react';
import { StravaActivity } from '@/strava-hooks'; 
import { MetricChart } from '@/metric-chart';
import { 
  calculateWeeklyMileage,
  calculateMonthlyMileage,
  groupActivitiesByWeek,
  groupActivitiesByMonth,
  formatDate,
  filterActivitiesByDateRange
 } from '@/data-transformers';

 /**
 * Props for the WeeklyMileageChart component
 */
interface WeeklyMileageChartProps {
  timeFrame: string;
  activities?: StravaActivity[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Weekly Mileage Chart component
 */
export function WeeklyMileageChart({ 
  timeFrame, 
  activities = [], 
  startDate, 
  endDate 
}: WeeklyMileageChartProps) {

  const chartData = React.useMemo(() => {
    if (!activities) return [];

    // Filter activities based on calculated start/end dates
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run');

    // Determine aggregation (weekly or monthly) based on timeframe duration
    let aggregationLevel: 'daily' | 'weekly' | 'monthly' = 'daily'; 
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 180) { // Longer than ~6 months
        aggregationLevel = 'monthly';
      } else if (diffDays > 7) { // Longer than 1 week up to ~6 months
        aggregationLevel = 'weekly';
      } // Otherwise, default 'daily' remains (<= 7 days)
    }

    let aggregatedMileage: Record<string, number>;

    if (aggregationLevel === 'monthly') {
      const monthlyGroups = groupActivitiesByMonth(filteredActivities);
      aggregatedMileage = calculateMonthlyMileage(monthlyGroups);
    } else if (aggregationLevel === 'weekly') {
      const weeklyGroups = groupActivitiesByWeek(filteredActivities);
      aggregatedMileage = calculateWeeklyMileage(weeklyGroups);
    } else {
      // Handle daily aggregation
      aggregatedMileage = filteredActivities.reduce((acc, activity) => {
        const dateKey = formatDate(activity.start_date);
        acc[dateKey] = (acc[dateKey] || 0) + activity.distance;
        return acc;
      }, {});
    }

    // Format for the chart
    const formattedData = Object.entries(aggregatedMileage).map(([dateKey, mileage]) => ({
      date: dateKey, // Use the week/month start date (YYYY-MM-DD)
      value: mileage
    }));

    // Sort by date
    formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return formattedData;
  }, [activities, startDate, endDate]); // Depend on activities and calculated dates

  return (
    <MetricChart
      data={chartData}
      dataKey="value"
      xAxisKey="date"
      name="Weekly Mileage"
      color="#2196F3"
      yAxisLabel="Miles"
      tooltipFormatter={(value): [React.ReactNode, string] => {
        if (typeof value !== 'number') return ['N/A', 'Mileage'];
        // Value is already in miles, just format it
        return [`${value.toFixed(2)} miles`, 'Mileage'];
      }}
    />
  );
}
