# Running Data Dashboard - Testing Instructions

This document provides instructions for testing the Strava Running Dashboard before deployment.

## Test Page

A dedicated test page has been created to verify the functionality of the dashboard. To access it:

1. Start the development server:
   ```
   cd /path/to/strava_dashboard/app
   pnpm dev
   ```

2. Navigate to http://localhost:3000/test in your browser

## What to Test

The test page includes two main components:

### 1. API Connection Test

This component tests the connection to the Strava API:
- Click the "Test API Connection" button
- If successful, you'll see your Strava athlete profile data
- If unsuccessful, you'll see an error message with troubleshooting suggestions

### 2. Data Verification

This component displays your running data in a table format:
- Select different time frames to view data from different periods
- Verify that the data matches what you see in your Strava account
- Check that all metrics (distance, duration, elevation, heart rate, cadence, power) are displayed correctly

## Common Issues and Solutions

### Authentication Problems

If you encounter authentication issues:
- Verify that your .env.local file contains the correct Strava API credentials
- Check that your Strava API application has the correct callback domain
- Try signing out and signing back in to refresh your authentication tokens

### Missing Data

If some data is missing:
- Ensure that your Strava account has activities for the selected time period
- Check that you've granted the necessary permissions to the application
- Some metrics (like heart rate, cadence, power) may not be available for all activities

### Visualization Issues

If charts don't display correctly:
- Verify that the data is available in the Data Verification table
- Check browser console for any JavaScript errors
- Try a different browser to rule out browser-specific issues

## Reporting Issues

If you encounter any issues that you can't resolve, please provide:
1. A description of the problem
2. Steps to reproduce the issue
3. Any error messages you see
4. Screenshots if applicable

## Next Steps

Once testing is complete and all issues are resolved, you can proceed to deployment using the instructions in the DEPLOYMENT_GUIDE.md file.
