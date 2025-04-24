"use client";

import React from 'react';
import { StravaActivity } from '@/strava-hooks';
import { MetricChart } from '@/metric-chart';
import { 
  filterActivitiesByDateRange, 
  getTimeFrameDateRange,
  mpsToMinPerMile,
  calculateWeeklyAveragePace,
  groupActivitiesByWeek,
  calculateMonthlyAveragePace,
  groupActivitiesByMonth,
  formatDate 
} from '@/data-transformers';

/**
 * Props for the AveragePaceChart component
 */
interface AveragePaceChartProps {
  timeFrame: string;
  activities?: StravaActivity[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Average Pace Chart component
 * Displays average pace per run over time
 */
export function AveragePaceChart({ 
  timeFrame,
  activities = [], // Default to empty array if undefined
  startDate,
  endDate
}: AveragePaceChartProps) {
   
  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];
    
    // Filter activities based on calculated start/end dates (important!) 
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run');

    console.log('[AvgPaceChart] Timeframe:', timeFrame, 'Start:', startDate, 'End:', endDate);

    // Determine aggregation level based on time range duration
    let aggregationLevel: 'daily' | 'weekly' | 'monthly' = 'daily';
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('[AvgPaceChart] Calculated diffDays:', diffDays);

      if (diffDays > 180) { // Longer than ~6 months
        aggregationLevel = 'monthly';
      } else if (diffDays > 7) { // Longer than 1 week up to ~6 months
        aggregationLevel = 'weekly';
      } // Otherwise, default 'daily' remains (<= 7 days)
    }

    console.log('[AvgPaceChart] Determined aggregationLevel:', aggregationLevel);

    let chartData: { date: string; paceValue: number; pace: string }[] = [];

    if (aggregationLevel === 'monthly') {
      const monthlyGroups = groupActivitiesByMonth(filteredActivities);
      const monthlyPaceData = calculateMonthlyAveragePace(monthlyGroups);
      chartData = Object.entries(monthlyPaceData).map(([monthKey, paceInfo]) => ({
        date: monthKey, // YYYY-MM-DD (first day of month)
        paceValue: paceInfo.paceValue,
        pace: paceInfo.pace,
      }));
    } else if (aggregationLevel === 'weekly') {
      const weeklyGroups = groupActivitiesByWeek(filteredActivities);
      const weeklyPaceData = calculateWeeklyAveragePace(weeklyGroups);
      chartData = Object.entries(weeklyPaceData).map(([weekKey, paceInfo]) => ({
        date: weekKey, // YYYY-MM-DD (Monday of week)
        paceValue: paceInfo.paceValue,
        pace: paceInfo.pace,
      }));
    } else {
      // Daily (individual runs)
      chartData = filteredActivities.map(activity => ({
        date: activity.start_date,
        paceValue: activity.average_speed > 0 ? (1609.344 / activity.average_speed) / 60 : 0,
        pace: mpsToMinPerMile(activity.average_speed),
      }));
    }

    // Sort final data by date
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return chartData;
  }, [activities, timeFrame, startDate, endDate]);

  // Calculate Y-axis domain based on processed data
  const { yAxisMin, yAxisMax } = React.useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return { yAxisMin: undefined, yAxisMax: undefined }; // Default if no data
    }

    const paceValues = processedData.map(d => d.paceValue).filter(p => typeof p === 'number' && p > 0); // Filter out non-positive paces
    if (paceValues.length === 0) {
      return { yAxisMin: 0, yAxisMax: 10 }; // Default range if no valid paces
    }

    let minVal = Math.min(...paceValues);
    let maxVal = Math.max(...paceValues);

    // Add padding (e.g., 1 minute/mile, or dynamic based on range)
    const padding = 1; // Fixed padding for pace
    minVal = Math.max(0, Math.floor(minVal - padding)); // Ensure min isn't negative
    maxVal = Math.ceil(maxVal + padding);

    // Handle case where min and max are too close or the same
    if (maxVal - minVal < 1) {
        maxVal = minVal + 1;
    }

    return { yAxisMin: minVal, yAxisMax: maxVal };
  }, [processedData]);

  return (
    <MetricChart
      data={processedData}
      dataKey="paceValue"
      xAxisKey="date"
      name="Average Pace"
      color="#4CAF50"
      yAxisLabel="Minutes per Mile"
      yAxisMin={yAxisMin}
      yAxisMax={yAxisMax}
      tooltipFormatter={(value) => { 
        // Ensure value is a number before processing
        if (typeof value !== 'number' || value <= 0) {
          return ['N/A', 'Pace'];
        }
        // Re-calculate MM:SS pace from numeric paceValue (decimal minutes per mile)
        const minutes = Math.floor(value);
        const seconds = Math.round((value - minutes) * 60);
        const paceString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        return [`${paceString} min/mile`, 'Pace'];
      }}
    />
  );
}
