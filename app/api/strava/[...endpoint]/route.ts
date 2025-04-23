import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/strava-auth';
import { StravaApiClient } from '@/strava-client';

/**
 * API route to proxy Strava API requests
 * This adds a layer of security by not exposing tokens to the client
 */
// Define the shape of the parameters for the GET function
interface Params {
  params: {
    endpoint: string[]; // This will capture segments like ['activities'] or ['activity', '123']
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  // Check if user is authenticated
  // Note: getServerSession needs authOptions passed directly in App Router
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Initialize Strava client with session tokens
    const stravaClient = new StravaApiClient(
      session.accessToken as string,
      session.refreshToken as string,
      session.expiresAt as number
    );

    // Determine the target endpoint from the URL path segments
    const endpointSegments = params.endpoint;
    const primaryEndpoint = endpointSegments[0]; // e.g., 'activities', 'activity', 'athlete'

    // Get search parameters from the request URL
    const searchParams = request.nextUrl.searchParams;

    switch (primaryEndpoint) {
      case 'activities':
        const before = searchParams.get('before');
        const after = searchParams.get('after');
        const page = searchParams.get('page');
        const per_page = searchParams.get('per_page');

        const apiParams = {
          before: before ? Number(before) : undefined,
          after: after ? Number(after) : undefined,
          page: page ? Number(page) : undefined,
          per_page: per_page ? Number(per_page) : undefined,
        };

        const activities = await stravaClient.getActivities(apiParams);
        return NextResponse.json(activities);

      case 'activity':
        const activityId = endpointSegments[1]; // The second segment should be the ID

        if (!activityId) {
          return NextResponse.json(
            { error: 'Activity ID is required in the URL path' },
            { status: 400 }
          );
        }

        const activity = await stravaClient.getActivity(activityId);
        return NextResponse.json(activity);

      case 'athlete':
        const athlete = await stravaClient.getAthlete();
        return NextResponse.json(athlete);

      default:
        return NextResponse.json(
          { error: 'Endpoint not found' },
          { status: 404 }
        );
    }
  } catch (error: any) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
