"use client";

import React, { useState } from 'react';
import { WeeklyMileageChart } from '@/weekly-mileage-chart';
import { AveragePaceChart } from '@/average-pace-chart';
import { ElevationChart } from '@/elevation-chart';
import { HeartRateChart } from '@/heart-rate-chart';
import { CadenceChart } from '@/cadence-chart';
import { PowerChart } from '@/power-chart';

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

  // Render the selected metric chart
  const renderMetricChart = () => {
    switch (selectedMetric) {
      case 'mileage':
        return <WeeklyMileageChart timeFrame={selectedTimeFrame} />;
      case 'pace':
        return <AveragePaceChart timeFrame={selectedTimeFrame} />;
      case 'elevation':
        return <ElevationChart timeFrame={selectedTimeFrame} />;
      case 'heart_rate':
        return <HeartRateChart timeFrame={selectedTimeFrame} />;
      case 'cadence':
        return <CadenceChart timeFrame={selectedTimeFrame} />;
      case 'power':
        return <PowerChart timeFrame={selectedTimeFrame} />;
      default:
        return <WeeklyMileageChart timeFrame={selectedTimeFrame} />;
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

      <div className="bg-white rounded-lg shadow-md p-6">
        {renderMetricChart()}
      </div>
    </div>
  );
}
