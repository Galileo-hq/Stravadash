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
 * Cadence Chart component
 * Displays average cadence per activity over time
 */
interface CadenceChartProps {
  timeFrame: string;
  activities?: StravaActivity[];
  startDate?: Date;
  endDate?: Date;
}

export function CadenceChart({ 
  timeFrame, 
  activities = [], 
  startDate, 
  endDate 
}: CadenceChartProps) {

  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];

    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run' && activity.average_cadence > 0);

    // Determine aggregation level
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

    let aggregatedCadenceData: { date: string; value: number }[] = [];

    if (aggregationLevel === 'daily') {
      aggregatedCadenceData = filteredActivities.map(activity => ({
        date: activity.start_date_local.split('T')[0], // Use YYYY-MM-DD part
        // Strava API returns cadence as revolutions per minute, multiply by 2 for steps per minute
        value: activity.average_cadence * 2,
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
        act => act.average_cadence * 2, // Average Cadence (SPM)
        act => act.moving_time // Weight by duration
      );

      aggregatedCadenceData = Object.entries(aggregatedAverages).map(([dateKey, avgCadence]) => ({
        date: dateKey, // YYYY-MM-DD group key
        value: avgCadence,
      }));
    }

    // Sort by date
    aggregatedCadenceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return aggregatedCadenceData;
  }, [activities, timeFrame, startDate, endDate]);

  // Calculate Y-axis domain based on processed data
  const { yAxisMin, yAxisMax } = React.useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return { yAxisMin: undefined, yAxisMax: undefined };
    }

    const cadenceValues = processedData.map(d => d.value).filter(c => typeof c === 'number');
    if (cadenceValues.length === 0) {
      return { yAxisMin: 150, yAxisMax: 200 }; // Default range if no data
    }

    let minVal = Math.min(...cadenceValues);
    let maxVal = Math.max(...cadenceValues);

    const padding = 5; // Fixed padding (e.g., 5 spm)
    minVal = Math.max(0, Math.floor(minVal - padding));
    maxVal = Math.ceil(maxVal + padding);

    // Handle case where min and max are too close or the same
    if (maxVal - minVal < 10) { // Ensure at least 10 spm range
        maxVal = minVal + 10;
    }

    return { yAxisMin: minVal, yAxisMax: maxVal };
  }, [processedData]);

  return (
    <MetricChart
      data={processedData}
      dataKey="value"
      xAxisKey="date"
      name="Average Cadence"
      color="#FFC107"
      yAxisLabel="SPM"
      yAxisMin={yAxisMin}
      yAxisMax={yAxisMax}
      tooltipFormatter={(value) => { 
        if (typeof value !== 'number') {
          return ['N/A', 'Cadence'];
        }
        return [`${value.toFixed(0)} spm`, 'Cadence'];
      }}
    />
  );
}
