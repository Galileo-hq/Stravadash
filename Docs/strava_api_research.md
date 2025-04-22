# Strava API Research

## Authentication
- Strava uses OAuth2 for authentication to the V3 API
- All developers need to register their application to get a client ID and client secret
- Authentication flow:
  1. Redirect user to Strava's authorization page
  2. User logs in and gives consent to the application
  3. Strava redirects back to the application with an authorization code
  4. Application exchanges the authorization code for a refresh token and access token
  5. Access tokens are used to access the API and expire after 6 hours
  6. Refresh tokens are used to obtain new access tokens

## Required Scopes
- `activity:read` - Read the user's activity data for activities visible to Everyone and Followers
- `activity:read_all` - Same as above plus privacy zone data and activities with visibility set to Only You

## Key Endpoints

### List Athlete Activities
- Endpoint: `GET /athlete/activities`
- Returns the activities of an athlete for a specific identifier
- Parameters:
  - `before` - Epoch timestamp to filter activities before a certain time
  - `after` - Epoch timestamp to filter activities after a certain time
  - `page` - Page number (defaults to 1)
  - `per_page` - Number of items per page (defaults to 30)

### Get Activity
- Endpoint: `GET /activities/{id}`
- Returns detailed information about a specific activity

## Available Metrics (from SummaryActivity model)
- `distance` - The activity's distance in meters
- `moving_time` - The activity's moving time in seconds
- `elapsed_time` - The activity's elapsed time in seconds
- `total_elevation_gain` - The activity's total elevation gain
- `elev_high` - The activity's highest elevation in meters
- `elev_low` - The activity's lowest elevation in meters
- `average_speed` - The activity's average speed in meters per second
- `max_speed` - The activity's max speed in meters per second
- `average_cadence` - Average cadence during the activity
- `average_watts` - Average power output in watts during the activity (rides only)
- `max_watts` - Maximum power output in watts (rides with power meter only)
- `weighted_average_watts` - Similar to Normalized Power (rides with power meter only)
- `kilojoules` - The total work done in kilojoules (rides only)
- `has_heartrate` - Whether the activity has heart rate data
- `average_heartrate` - Average heart rate during the activity (if available)
- `max_heartrate` - Maximum heart rate during the activity (if available)
- `start_date` - The time at which the activity was started
- `start_date_local` - The time at which the activity was started in the local timezone

## Rate Limits
- Default rate limit: 200 requests every 15 minutes
- Daily limit: 2,000 requests per day

## Considerations for Dashboard Implementation
- Need to implement OAuth2 authentication flow
- Need to store refresh tokens securely to maintain access
- Should implement caching to avoid hitting rate limits
- Need to convert units for display (e.g., meters to miles, m/s to min/mile)
- Need to aggregate data for weekly/monthly/yearly views
- Should handle pagination for retrieving large sets of activities
