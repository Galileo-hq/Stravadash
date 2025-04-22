import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/strava-auth';
import { StravaApiClient } from '@/lib/api/strava-client';

/**
 * API route to proxy Strava API requests
 * This adds a layer of security by not exposing tokens to the client
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Initialize Strava client with session tokens
    const stravaClient = new StravaApiClient(
      session.accessToken as string,
      session.refreshToken as string,
      session.expiresAt as number
    );
    
    // Handle different API endpoints
    const { endpoint } = req.query;
    
    switch (endpoint) {
      case 'activities':
        // Extract query parameters
        const { before, after, page, per_page } = req.query;
        
        // Convert query parameters to the correct types
        const params = {
          before: before ? Number(before) : undefined,
          after: after ? Number(after) : undefined,
          page: page ? Number(page) : undefined,
          per_page: per_page ? Number(per_page) : undefined,
        };
        
        const activities = await stravaClient.getActivities(params);
        return res.status(200).json(activities);
        
      case 'activity':
        const { activityId } = req.query;
        
        if (!activityId || Array.isArray(activityId)) {
          return res.status(400).json({ error: 'Activity ID is required' });
        }
        
        const activity = await stravaClient.getActivity(activityId);
        return res.status(200).json(activity);
        
      case 'athlete':
        const athlete = await stravaClient.getAthlete();
        return res.status(200).json(athlete);
        
      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
