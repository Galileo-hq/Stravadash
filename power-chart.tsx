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
 * Power Chart component
 * Displays average power per activity over time
 */
interface PowerChartProps {
  timeFrame: string;
  activities?: StravaActivity[];
  startDate?: Date;
  endDate?: Date;
}

export function PowerChart({ 
  timeFrame, 
  activities = [], 
  startDate, 
  endDate 
}: PowerChartProps) {

  // Process the data when activities are loaded
  const chartData = React.useMemo(() => {
    if (!activities) return [];

    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run' && activity.average_watts > 0);

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

    let aggregatedPowerData: { date: string; value: number }[] = [];

    if (aggregationLevel === 'daily') {
      aggregatedPowerData = filteredActivities.map(activity => ({
        date: activity.start_date_local.split('T')[0], // Use YYYY-MM-DD part
        value: activity.average_watts,
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
        act => act.average_watts, // Average Power
        act => act.moving_time // Weight by duration
      );

      aggregatedPowerData = Object.entries(aggregatedAverages).map(([dateKey, avgPower]) => ({
        date: dateKey, // YYYY-MM-DD group key
        value: avgPower,
      }));
    }

    // Sort by date
    aggregatedPowerData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return aggregatedPowerData;
  }, [activities, startDate, endDate]);

  // Calculate Y-axis domain based on processed data
  const { yAxisMin, yAxisMax } = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { yAxisMin: undefined, yAxisMax: undefined };
    }

    const powerValues = chartData.map(d => d.value).filter(p => typeof p === 'number');
    if (powerValues.length === 0) {
      return { yAxisMin: 100, yAxisMax: 300 }; // Default range if no data
    }

    let minVal = Math.min(...powerValues);
    let maxVal = Math.max(...powerValues);

    const padding = 20; // Fixed padding (e.g., 20 watts)
    minVal = Math.max(0, Math.floor(minVal - padding));
    maxVal = Math.ceil(maxVal + padding);

    // Handle case where min and max are too close or the same
    if (maxVal - minVal < 40) { // Ensure at least 40W range
        maxVal = minVal + 40;
    }

    return { yAxisMin: minVal, yAxisMax: maxVal };
  }, [chartData]);

  return (
    <MetricChart
      data={chartData}
      dataKey="value"
      xAxisKey="date"
      name="Average Power"
      color="#FF9800"
      yAxisLabel="Watts"
      yAxisMin={yAxisMin}
      yAxisMax={yAxisMax}
      tooltipFormatter={(value) => { 
        if (typeof value !== 'number') {
          return ['N/A', 'Power'];
        }
        return [`${value.toFixed(0)} watts`, 'Power'];
      }}
      // Use default x-axis formatting
    />
  );
}
