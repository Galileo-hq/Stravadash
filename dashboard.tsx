"use client";

import React, { useState, useMemo } from 'react';
import { WeeklyMileageChart } from '@/weekly-mileage-chart';
import { AveragePaceChart } from '@/average-pace-chart';
import { ElevationChart } from '@/elevation-chart';
import { HeartRateChart } from '@/heart-rate-chart';
import { CadenceChart } from '@/cadence-chart';
import { PowerChart } from '@/power-chart';
import { useActivities } from '@/strava-hooks';
import { getTimeFrameDateRange } from '@/data-transformers';

/**
 * Time frame options for the dashboard
 */
const TIME_FRAME_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'three_months', label: 'Three Months' },
  { value: 'year', label: 'Year' },
  { value: 'two_years', label: 'Two Years' },
  { value: 'three_years', label: 'Three Years' },
  { value: 'all', label: 'All Time' },
];

/**
 * Metric options for the dashboard
 */
const METRIC_OPTIONS = [
  { value: 'mileage', label: 'Weekly Mileage' },
  { value: 'pace', label: 'Average Pace' },
  { value: 'elevation', label: 'Elevation Gain' },
  { value: 'heart_rate', label: 'Heart Rate' },
  { value: 'cadence', label: 'Cadence' },
  { value: 'power', label: 'Power' },
];

/**
 * Dashboard component that displays the selected metric chart
 */
export function Dashboard() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('mileage');

  // Fetch activities once here based on the selected time frame
  const { data: activities, isLoading, error } = useActivities(selectedTimeFrame);

  // Calculate startDate and endDate based on the selected time frame
  const { startDate, endDate } = getTimeFrameDateRange(selectedTimeFrame);

  // Memoize the selected time frame label for the loading message
  const selectedTimeFrameLabel = useMemo(() => {
    return TIME_FRAME_OPTIONS.find(opt => opt.value === selectedTimeFrame)?.label || selectedTimeFrame;
  }, [selectedTimeFrame]);

  // Memoize the check for long time frames
  const isLongTimeFrame = useMemo(() => {
    return ['year', 'two_years', 'three_years', 'all'].includes(selectedTimeFrame);
  }, [selectedTimeFrame]);

  // Render the selected metric chart
  const renderMetricChart = () => {
    switch (selectedMetric) {
      case 'mileage':
        return <WeeklyMileageChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
      case 'pace':
        return <AveragePaceChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
      case 'elevation':
        return <ElevationChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
      case 'heart_rate':
        return <HeartRateChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
      case 'cadence':
        return <CadenceChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
      case 'power':
        return <PowerChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
      default:
        return <WeeklyMileageChart timeFrame={selectedTimeFrame} activities={activities} startDate={startDate} endDate={endDate} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <label htmlFor="metric-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Metric
          </label>
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {METRIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="time-frame-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Time Frame
          </label>
          <select
            id="time-frame-select"
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {TIME_FRAME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 min-h-[300px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading activities...</p>
            {isLongTimeFrame && (
              <p className="text-sm text-gray-500">(Fetching {selectedTimeFrameLabel} data, this may take a moment)</p>
            )}
          </div>
        ) : error ? (
          <p className="text-red-600 text-center">Error loading activities: {error.message}</p>
        ) : (
          renderMetricChart()
        )}
      </div>
    </div>
  );
}
