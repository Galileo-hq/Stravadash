 "use client";

import React from 'react';
import { StravaActivity } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';
import { 
  filterActivitiesByDateRange, 
  metersToFeet,
  groupActivitiesByWeek,
  groupActivitiesByMonth,
  calculateAggregatedTotal,
  formatDate 
} from '@/data-transformers';

/**
 * Elevation Chart component
 * Displays elevation gain per activity over time
 */
interface ElevationChartProps {
  timeFrame: string;
  activities?: StravaActivity[];
  startDate?: Date;
  endDate?: Date;
}

export function ElevationChart({ 
  timeFrame, 
  activities = [], 
  startDate, 
  endDate 
}: ElevationChartProps) {

  // Process the data
  const chartData = React.useMemo(() => {
    if (!activities) return [];

    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run');

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

    let aggregatedElevationData: { date: string; value: number }[] = [];

    if (aggregationLevel === 'daily') {
      aggregatedElevationData = filteredActivities.map(activity => ({
        date: activity.start_date_local.split('T')[0], // Use YYYY-MM-DD part
        value: metersToFeet(activity.total_elevation_gain),
      }));
    } else {
      let groupedActivities: Record<string, StravaActivity[]>;
      if (aggregationLevel === 'monthly') {
        groupedActivities = groupActivitiesByMonth(filteredActivities);
      } else { // weekly
        groupedActivities = groupActivitiesByWeek(filteredActivities);
      }

      const aggregatedTotalsMeters = calculateAggregatedTotal(
        groupedActivities,
        act => act.total_elevation_gain // Sum elevation gain
      );

      aggregatedElevationData = Object.entries(aggregatedTotalsMeters).map(([dateKey, totalMeters]) => ({
        date: dateKey, // YYYY-MM-DD group key
        value: metersToFeet(totalMeters),
      }));
    }

    // Sort by date
    aggregatedElevationData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return aggregatedElevationData;
  }, [activities, startDate, endDate]);

  return (
    <MetricChart
      data={chartData}
      dataKey="value"
      xAxisKey="date"
      name="Elevation Gain"
      color="#607D8B"
      yAxisLabel="Feet"
      tooltipFormatter={(value) => { 
        if (typeof value !== 'number') {
          return ['N/A', 'Elevation Gain'];
        }
        return [`${value.toFixed(0)} ft`, 'Elevation Gain'];
      }}
      // Use default x-axis formatting
    />
  );
}
