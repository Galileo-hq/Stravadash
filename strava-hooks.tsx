"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStrava } from '@/strava-context';
import { 
  filterActivitiesByDateRange, 
  groupActivitiesByWeek, 
  calculateWeeklyMileage,
  calculateWeeklyAveragePace,
  getTimeFrameDateRange
} from './data-transformers';

// --- Basic Placeholder Types (Refine later if needed) ---
interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string; // ISO 8601 string
  average_speed?: number;
  max_speed?: number;
  average_cadence?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
}

interface AthleteProfile {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string; // URL to medium profile picture
  profile: string; // URL to large profile picture
}
// ------------------------------------------------------

/**
 * Hook to fetch athlete profile data
 */
export function useAthleteProfile() {
  const { client, isLoading: clientLoading } = useStrava();
  
  return useQuery<AthleteProfile, Error>({
    queryKey: ['athlete-profile'],
    queryFn: async (): Promise<AthleteProfile> => {
      if (!client) throw new Error('Strava client not initialized');
      const profile = await client.getAthlete();
      return profile as AthleteProfile;
    },
    enabled: !!client && !clientLoading,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
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
  const before = endDate ? Math.floor(endDate.getTime() / 1000) : undefined;

  return useQuery<StravaActivity[], Error>({
    queryKey: ['activities', timeFrame, after, before], // Include timestamps in key
    queryFn: async (): Promise<StravaActivity[]> => {
      if (!client) throw new Error('Strava client not initialized');
      
      // Fetch all pages of activities
      let page = 1;
      const perPage = 100;
      let allActivities: StravaActivity[] = [];
      let hasMore = true;
      
      while (hasMore) {
        const activities = await client.getActivities({
          after,
          before,
          page,
          per_page: perPage,
        });
        
        allActivities = [...allActivities, ...activities];
        
        // Check if we need to fetch more pages
        hasMore = activities.length === perPage;
        page++;
      }

      // Add explicit type guard
      if (!Array.isArray(allActivities)) {
        console.error("Fetched activities data is not an array:", allActivities);
        return []; // Return empty array on unexpected type
      }

      return allActivities as StravaActivity[];
    },
    enabled: !!client && !clientLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a specific activity
 * @param activityId The ID of the activity to fetch
 */
export function useActivity(activityId: string | undefined) {
  const { client, isLoading: clientLoading } = useStrava();
  
  return useQuery<StravaActivity, Error>({
    queryKey: ['activity', activityId],
    queryFn: async (): Promise<StravaActivity> => {
      if (!client) throw new Error('Strava client not initialized');
      if (!activityId) throw new Error('Activity ID is required');
      
      const activity = await client.getActivity(activityId);
      return activity as StravaActivity;
    },
    enabled: !!client && !clientLoading && !!activityId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
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
