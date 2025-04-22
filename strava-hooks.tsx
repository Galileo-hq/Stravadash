"use client";

import React from 'react';
import { useQuery } from 'react-query';
import { useStrava } from '../auth/strava-context';
import { 
  filterActivitiesByDateRange, 
  groupActivitiesByWeek, 
  calculateWeeklyMileage,
  calculateWeeklyAveragePace,
  getTimeFrameDateRange
} from './data-transformers';

/**
 * Hook to fetch athlete profile data
 */
export function useAthleteProfile() {
  const { client, isLoading: clientLoading } = useStrava();
  
  return useQuery(
    ['athlete-profile'],
    async () => {
      if (!client) throw new Error('Strava client not initialized');
      return client.getAthlete();
    },
    {
      enabled: !!client && !clientLoading,
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  );
}

/**
 * Hook to fetch athlete activities
 * @param timeFrame The time frame to fetch activities for
 */
export function useActivities(timeFrame: string = 'all') {
  const { client, isLoading: clientLoading } = useStrava();
  const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
  
  // Convert dates to Unix timestamps for the API
  const after = startDate ? Math.floor(startDate.getTime() / 1000) : undefined;
  
  return useQuery(
    ['activities', timeFrame],
    async () => {
      if (!client) throw new Error('Strava client not initialized');
      
      // Fetch all pages of activities
      let page = 1;
      const perPage = 100;
      let allActivities: any[] = [];
      let hasMore = true;
      
      while (hasMore) {
        const activities = await client.getActivities({
          after,
          page,
          per_page: perPage,
        });
        
        allActivities = [...allActivities, ...activities];
        
        // Check if we need to fetch more pages
        hasMore = activities.length === perPage;
        page++;
      }
      
      return allActivities;
    },
    {
      enabled: !!client && !clientLoading,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

/**
 * Hook to fetch a specific activity
 * @param activityId The ID of the activity to fetch
 */
export function useActivity(activityId: string | undefined) {
  const { client, isLoading: clientLoading } = useStrava();
  
  return useQuery(
    ['activity', activityId],
    async () => {
      if (!client) throw new Error('Strava client not initialized');
      if (!activityId) throw new Error('Activity ID is required');
      
      return client.getActivity(activityId);
    },
    {
      enabled: !!client && !clientLoading && !!activityId,
      staleTime: 1000 * 60 * 60, // 1 hour
    }
  );
}

/**
 * Hook to fetch weekly mileage data
 * @param timeFrame The time frame to fetch data for
 */
export function useWeeklyMileage(timeFrame: string = 'year') {
  const { data: activities, isLoading, error } = useActivities(timeFrame);
  
  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return null;
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate);
    const weeklyActivities = groupActivitiesByWeek(filteredActivities);
    const weeklyMileage = calculateWeeklyMileage(weeklyActivities);
    
    // Convert to array format for charts
    return Object.entries(weeklyMileage).map(([week, miles]) => ({
      week,
      miles,
    })).sort((a, b) => a.week.localeCompare(b.week));
  }, [activities, timeFrame]);
  
  return {
    data: processedData,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch weekly average pace data
 * @param timeFrame The time frame to fetch data for
 */
export function useWeeklyAveragePace(timeFrame: string = 'year') {
  const { data: activities, isLoading, error } = useActivities(timeFrame);
  
  // Process the data when activities are loaded
  const processedData = React.useMemo(() => {
    if (!activities) return null;
    
    const { startDate, endDate } = getTimeFrameDateRange(timeFrame);
    const filteredActivities = filterActivitiesByDateRange(activities, startDate, endDate);
    const weeklyActivities = groupActivitiesByWeek(filteredActivities);
    const weeklyPace = calculateWeeklyAveragePace(weeklyActivities);
    
    // Convert to array format for charts
    return Object.entries(weeklyPace).map(([week, pace]) => ({
      week,
      pace,
      // Convert pace string (MM:SS) to numeric value for charting
      paceValue: paceStringToSeconds(pace) / 60,
    })).sort((a, b) => a.week.localeCompare(b.week));
  }, [activities, timeFrame]);
  
  return {
    data: processedData,
    isLoading,
    error,
  };
}

// Helper function to convert pace string to seconds
function paceStringToSeconds(pace: string): number {
  if (pace === '0:00') return 0;
  
  const [minutes, seconds] = pace.split(':').map(Number);
  return minutes * 60 + seconds;
}
