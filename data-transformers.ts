/**
 * Data transformation utilities for Strava API responses
 * 
 * Provides functions to convert and format data for display in the dashboard
 */

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

/**
 * Convert meters per second to minutes per mile pace
 */
export function mpsToMinPerMile(metersPerSecond: number): string {
  if (metersPerSecond === 0) return '0:00';
  
  // Convert m/s to seconds per mile
  const secondsPerMile = (1609.344 / metersPerSecond);
  
  // Convert to minutes and seconds
  const minutes = Math.floor(secondsPerMile / 60);
  const seconds = Math.floor(secondsPerMile % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Format seconds as HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format date as MM/DD/YYYY
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Group activities by week
 */
export function groupActivitiesByWeek(activities: any[]) {
  const weeks: Record<string, any[]> = {};
  
  activities.forEach(activity => {
    const date = new Date(activity.start_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Set to Sunday
    weekStart.setHours(0, 0, 0, 0);
    
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    weeks[weekKey].push(activity);
  });
  
  return weeks;
}

/**
 * Calculate weekly mileage from activities
 */
export function calculateWeeklyMileage(weeklyActivities: Record<string, any[]>) {
  const weeklyMileage: Record<string, number> = {};
  
  Object.entries(weeklyActivities).forEach(([week, activities]) => {
    const totalMeters = activities.reduce((sum, activity) => {
      // Only include runs
      if (activity.type === 'Run') {
        return sum + activity.distance;
      }
      return sum;
    }, 0);
    
    weeklyMileage[week] = metersToMiles(totalMeters);
  });
  
  return weeklyMileage;
}

/**
 * Calculate average pace per week
 */
export function calculateWeeklyAveragePace(weeklyActivities: Record<string, any[]>) {
  const weeklyPace: Record<string, string> = {};
  
  Object.entries(weeklyActivities).forEach(([week, activities]) => {
    let totalDistance = 0;
    let totalTime = 0;
    
    activities.forEach(activity => {
      if (activity.type === 'Run') {
        totalDistance += activity.distance;
        totalTime += activity.moving_time;
      }
    });
    
    if (totalDistance > 0 && totalTime > 0) {
      const averageSpeed = totalDistance / totalTime;
      weeklyPace[week] = mpsToMinPerMile(averageSpeed);
    } else {
      weeklyPace[week] = '0:00';
    }
  });
  
  return weeklyPace;
}

/**
 * Filter activities by date range
 */
export function filterActivitiesByDateRange(activities: any[], startDate?: Date, endDate?: Date) {
  return activities.filter(activity => {
    const activityDate = new Date(activity.start_date);
    
    if (startDate && activityDate < startDate) {
      return false;
    }
    
    if (endDate && activityDate > endDate) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get time frame date range
 */
export function getTimeFrameDateRange(timeFrame: string): { startDate?: Date, endDate?: Date } {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  
  switch (timeFrame) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return { startDate: weekStart, endDate };
      
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: monthStart, endDate };
      
    case 'three_months':
      const threeMonthsStart = new Date(now);
      threeMonthsStart.setMonth(now.getMonth() - 3);
      return { startDate: threeMonthsStart, endDate };
      
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { startDate: yearStart, endDate };
      
    case 'two_years':
      const twoYearsStart = new Date(now);
      twoYearsStart.setFullYear(now.getFullYear() - 2);
      return { startDate: twoYearsStart, endDate };
      
    case 'three_years':
      const threeYearsStart = new Date(now);
      threeYearsStart.setFullYear(now.getFullYear() - 3);
      return { startDate: threeYearsStart, endDate };
      
    case 'all':
      return { startDate: undefined, endDate };
      
    default:
      return { startDate: undefined, endDate };
  }
}
