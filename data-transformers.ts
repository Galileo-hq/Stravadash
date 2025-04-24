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
 * Takes a 'YYYY-MM-DD' string and formats it as MM/DD respecting local timezone.
 */
export function formatDate(dateString: string): string {
  // Ensure valid date string before processing
  if (!dateString || !/\d{4}-\d{2}-\d{2}/.test(dateString)) return '';
  
  // Split the string and create date in local timezone to avoid UTC conversion issues
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  
  // Check if parts are valid numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  const localDate = new Date(year, month, day);
  
  // Check if the resulting date is valid (e.g., handles invalid dates like 2023-02-30)
  if (isNaN(localDate.getTime())) return '';
  
  // Return in MM/DD format
  return `${localDate.getMonth() + 1}/${localDate.getDate()}`;
}

/**
 * Group activities by week
 */
export function groupActivitiesByWeek(activities: any[]) {
  const weeks: Record<string, any[]> = {};
  
  activities.forEach(activity => {
    // Use start_date_local to ensure week grouping aligns with local timezone days
    const date = new Date(activity.start_date_local);
    const weekStart = new Date(date);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days to subtract to get to Monday
    weekStart.setDate(date.getDate() - diff); // Sets to the previous Monday
    weekStart.setHours(0, 0, 0, 0);
    
    const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    weeks[weekKey].push(activity);
  });
  
  return weeks;
}

/**
 * Group activities by month
 */
export function groupActivitiesByMonth(activities: any[]) {
  const months: Record<string, any[]> = {};

  activities.forEach(activity => {
    const date = new Date(activity.start_date);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthKey = monthStart.toISOString().split('T')[0]; // YYYY-MM-DD format (first day of month)

    if (!months[monthKey]) {
      months[monthKey] = [];
    }

    months[monthKey].push(activity);
  });

  return months;
}

/**
 * Generic function to calculate total of a metric per group (for 'Run' activities)
 */
export function calculateAggregatedTotal(
  groupedActivities: Record<string, any[]>,
  metricAccessor: (activity: any) => number
): Record<string, number> {
  const aggregatedTotal: Record<string, number> = {};

  Object.entries(groupedActivities).forEach(([groupKey, activities]) => {
    const runActivities = activities.filter(act => act.type === 'Run');
    const totalValue = runActivities.reduce((sum, activity) => {
      // Ensure metric exists and is a number before adding
      const metric = metricAccessor(activity);
      return sum + (typeof metric === 'number' ? metric : 0);
    }, 0);
    aggregatedTotal[groupKey] = totalValue;
  });

  return aggregatedTotal;
}

/**
 * Generic function to calculate average of a metric per group (weighted, for 'Run' activities)
 * Example: Average Speed (value=distance, weight=time) -> total distance / total time
 */
export function calculateAggregatedAverage(
  groupedActivities: Record<string, any[]>,
  valueAccessor: (activity: any) => number, // e.g., distance for speed calculation
  weightAccessor: (activity: any) => number // e.g., moving_time for speed calculation
): Record<string, number> {
  const aggregatedAverage: Record<string, number> = {};

  Object.entries(groupedActivities).forEach(([groupKey, activities]) => {
    let totalWeightedValue = 0; // sum(value * weight)
    let totalWeight = 0;
    const runActivities = activities.filter(act => act.type === 'Run');

    runActivities.forEach(activity => {
      // Ensure values exist and are numbers before calculation
      const value = valueAccessor(activity);
      const weight = weightAccessor(activity);
      // Also ensure weight is positive to avoid division by zero or strange results
      if (typeof value === 'number' && typeof weight === 'number' && weight > 0) {
        totalWeightedValue += value * weight; // Accumulate weighted value
        totalWeight += weight;
      }
    });

    if (totalWeight > 0) {
      aggregatedAverage[groupKey] = totalWeightedValue / totalWeight; // Correct weighted average
    } else {
      aggregatedAverage[groupKey] = 0;
    }
  });

  return aggregatedAverage;
}

// Specific function for Average Speed (Total Distance / Total Time)
export function calculateAggregatedAverageSpeed(
  groupedActivities: Record<string, any[]>,
): Record<string, number> {
  const aggregatedAverageSpeed: Record<string, number> = {};

  Object.entries(groupedActivities).forEach(([groupKey, activities]) => {
    let totalDistance = 0;
    let totalMovingTime = 0;
    const runActivities = activities.filter(act => act.type === 'Run');

    runActivities.forEach(activity => {
      const distance = activity.distance;
      const movingTime = activity.moving_time;
      if (typeof distance === 'number' && typeof movingTime === 'number' && movingTime > 0) {
        totalDistance += distance;
        totalMovingTime += movingTime;
      }
    });

    if (totalMovingTime > 0) {
      aggregatedAverageSpeed[groupKey] = totalDistance / totalMovingTime; // total distance / total time
    } else {
      aggregatedAverageSpeed[groupKey] = 0;
    }
  });

  return aggregatedAverageSpeed;
}

/**
 * Calculate weekly mileage from activities
 */
export function calculateWeeklyMileage(weeklyActivities: Record<string, any[]>) {
  // Use generic total calculator
  const weeklyTotalMeters = calculateAggregatedTotal(weeklyActivities, act => act.distance);
  const weeklyMileage: Record<string, number> = {};
  Object.entries(weeklyTotalMeters).forEach(([week, totalMeters]) => {
    weeklyMileage[week] = metersToMiles(totalMeters);
  });
  return weeklyMileage;
}

/**
 * Calculate monthly mileage from activities
 */
export function calculateMonthlyMileage(monthlyActivities: Record<string, any[]>) {
  const monthlyTotalMeters = calculateAggregatedTotal(monthlyActivities, act => act.distance);
  const monthlyMileage: Record<string, number> = {};
  Object.entries(monthlyTotalMeters).forEach(([month, totalMeters]) => {
    monthlyMileage[month] = metersToMiles(totalMeters);
  });
  return monthlyMileage;
}

/**
 * Calculate average pace per week
 */
export function calculateWeeklyAveragePace(weeklyActivities: Record<string, any[]>) {
  const weeklyPaceData: Record<string, { pace: string; paceValue: number }> = {};
  // Use the CORRECT function for average speed
  const weeklyAverageSpeedMps = calculateAggregatedAverageSpeed(weeklyActivities);

  // Convert average speed to pace
  Object.entries(weeklyAverageSpeedMps).forEach(([week, avgSpeed]) => {
    const paceString = mpsToMinPerMile(avgSpeed);
    const paceValue = avgSpeed > 0 ? (1609.344 / avgSpeed) / 60 : 0; // Decimal minutes per mile
    weeklyPaceData[week] = { pace: paceString, paceValue };
  });
  return weeklyPaceData;
}

/**
 * Calculate average pace per month
 */
export function calculateMonthlyAveragePace(monthlyActivities: Record<string, any[]>) {
  const monthlyPaceData: Record<string, { pace: string; paceValue: number }> = {};
  // Use the CORRECT function for average speed
  const monthlyAverageSpeedMps = calculateAggregatedAverageSpeed(monthlyActivities);

  Object.entries(monthlyAverageSpeedMps).forEach(([month, avgSpeed]) => {
    const paceString = mpsToMinPerMile(avgSpeed);
    const paceValue = avgSpeed > 0 ? (1609.344 / avgSpeed) / 60 : 0; // Decimal minutes per mile
    monthlyPaceData[month] = { pace: paceString, paceValue };
  });
  return monthlyPaceData;
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
