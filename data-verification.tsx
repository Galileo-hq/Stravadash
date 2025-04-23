"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useActivities } from '@/strava-hooks';
import { 
  filterActivitiesByDateRange, 
  getTimeFrameDateRange,
  metersToMiles,
  formatDate,
  formatDuration
} from '@/data-transformers';

/**
 * Data Verification component for testing data accuracy
 * This component displays raw activity data for verification
 */
export function DataVerification() {
  const { data: session } = useSession();
  const [timeFrame, setTimeFrame] = React.useState('month');
  const { data: activities, isLoading, error } = useActivities(timeFrame);

  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return [];
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    return filterActivitiesByDateRange(activities, startDate, endDate)
      .filter(activity => activity.type === 'Run')
      .map(activity => ({
        id: activity.id,
        name: activity.name,
        date: formatDate(activity.start_date),
        distance: metersToMiles(activity.distance).toFixed(2) + ' miles',
        duration: formatDuration(activity.moving_time),
        elevation: activity.total_elevation_gain + ' m',
        heartRate: activity.has_heartrate ? activity.average_heartrate.toFixed(0) + ' bpm' : 'N/A',
        cadence: activity.average_cadence ? (activity.average_cadence * 2).toFixed(0) + ' spm' : 'N/A',
        power: activity.average_watts ? activity.average_watts.toFixed(0) + ' watts' : 'N/A',
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, timeFrame]);

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Please sign in to view your data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Data Verification</h2>
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="three_months">Three Months</option>
          <option value="year">Year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
          <p className="ml-2 text-gray-500">Loading data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded text-red-800">
          Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      ) : processedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No running activities found for the selected time period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elevation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadence</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Power</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.distance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.elevation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.heartRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.cadence}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.power}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
