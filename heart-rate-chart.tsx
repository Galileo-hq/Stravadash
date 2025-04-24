"use client";

import React from 'react';
import { StravaActivity } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';
import { 
  filterActivitiesByDateRange, 
  groupActivitiesByWeek,
  groupActivitiesByMonth,
  calculateAggregatedAverage,
  formatDate 
} from '@/data-transformers';

/**
 * Heart Rate Chart component
 * Displays average heart rate per activity over time
 */
interface HeartRateChartProps {
  timeFrame: string;
  activities?: StravaActivity[];
  startDate?: Date;
  endDate?: Date;
}

export function HeartRateChart({ 
  timeFrame, 
  activities = [], 
  startDate, 
  endDate 
}: HeartRateChartProps) {

  // Process the data when activities are loaded
  const chartData = React.useMemo(() => {
    if (!activities) return [];

    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run' && activity.has_heartrate && activity.average_heartrate > 0);

    // Determine aggregation level
    let aggregationLevel: 'daily' | 'weekly' | 'monthly' = 'daily';
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 180) { // Longer than ~6 months
        aggregationLevel = 'monthly';
      } else if (diffDays > 7) { // Longer than 1 week up to ~6 months
        aggregationLevel = 'weekly';
      }
    }

    let aggregatedHeartRateData: { date: string; value: number }[] = [];

    if (aggregationLevel === 'daily') {
      aggregatedHeartRateData = filteredActivities.map(activity => ({
        date: activity.start_date_local.split('T')[0], // Use YYYY-MM-DD part
        value: activity.average_heartrate,
      }));
    } else {
      let groupedActivities: Record<string, StravaActivity[]>;
      if (aggregationLevel === 'monthly') {
        groupedActivities = groupActivitiesByMonth(filteredActivities);
      } else { // weekly
        groupedActivities = groupActivitiesByWeek(filteredActivities);
      }

      const aggregatedAverages = calculateAggregatedAverage(
        groupedActivities,
        act => act.average_heartrate, // Average HR
        act => act.moving_time // Weight by duration
      );

      aggregatedHeartRateData = Object.entries(aggregatedAverages).map(([dateKey, avgHr]) => ({
        date: dateKey, // YYYY-MM-DD group key
        value: avgHr,
      }));
    }

    // Sort by date
    aggregatedHeartRateData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return aggregatedHeartRateData;
  }, [activities, timeFrame, startDate, endDate]);

  // Calculate Y-axis domain based on processed data
  const { yAxisMin, yAxisMax } = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { yAxisMin: undefined, yAxisMax: undefined };
    }

    const hrValues = chartData.map(d => d.value).filter(hr => typeof hr === 'number');
    if (hrValues.length === 0) {
      return { yAxisMin: 80, yAxisMax: 180 }; // Default range if no data
    }

    let minVal = Math.min(...hrValues);
    let maxVal = Math.max(...hrValues);

    const padding = 5; // Fixed padding (e.g., 5 bpm)
    minVal = Math.max(0, Math.floor(minVal - padding));
    maxVal = Math.ceil(maxVal + padding);

    // Handle case where min and max are too close or the same
    if (maxVal - minVal < 10) { // Ensure at least 10bpm range
        maxVal = minVal + 10;
    }

    return { yAxisMin: minVal, yAxisMax: maxVal };
  }, [chartData]);

  return (
    <MetricChart
      data={chartData}
      dataKey="value"
      xAxisKey="date"
      name="Average Heart Rate"
      color="#F44336"
      yAxisLabel="BPM"
      yAxisMin={yAxisMin}
      yAxisMax={yAxisMax}
      tooltipFormatter={(value) => {
        if (typeof value !== 'number') {
          return ['N/A', 'Heart Rate'];
        }
        return [`${value.toFixed(2)} bpm`, 'Heart Rate'];
      }}
    />
  );
}
