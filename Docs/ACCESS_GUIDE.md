# Accessing and Sharing Your Strava Dashboard

This guide provides instructions for accessing your deployed Strava dashboard and sharing it with others.

## Accessing Your Dashboard

### Personal Access

1. **Direct URL Access**
   - Visit your dashboard URL (e.g., `https://your-strava-dashboard.vercel.app` or your custom domain)
   - Log in with your Strava account by clicking the "Login with Strava" button
   - Your dashboard will load with your personal running data

2. **Bookmarking for Easy Access**
   - Bookmark your dashboard URL in your browser
   - Add it to your home screen on mobile devices for quick access
   - Consider setting it as your browser's homepage if you check it frequently

3. **Session Management**
   - Your login session will typically last for 2 weeks
   - After session expiration, you'll need to log in again
   - The dashboard will automatically redirect you to the login page when needed

## Sharing Your Dashboard

### Public Sharing

If you want to share your dashboard with others:

1. **Direct Link Sharing**
   - Share your dashboard URL with others
   - Note: They will need to log in with their own Strava accounts to view their data
   - Your personal data is not accessible to others unless you specifically set up sharing

2. **Social Media Sharing**
   - Use the sharing buttons on your dashboard (if implemented)
   - Or manually share your dashboard URL on social platforms
   - Consider adding a screenshot of your dashboard when sharing

### Private Sharing

For more controlled sharing:

1. **Password Protection**
   - If you've set up password protection in Vercel (see Domain Settings Guide)
   - Share both the URL and the password with trusted individuals
   - This adds an extra layer of security

2. **Limited Access**
   - Create specific user accounts if you've implemented custom authentication
   - Assign view-only permissions to specific users
   - Monitor access through your dashboard's admin panel (if implemented)

## Embedding Options

If you want to embed your dashboard elsewhere:

1. **Website Embedding**
   - Use an iframe to embed your dashboard on another website:
   ```html
   <iframe src="https://your-strava-dashboard.vercel.app" width="100%" height="800px" frameborder="0"></iframe>
   ```
   - Adjust width and height as needed

2. **Blog Integration**
   - Create a screenshot of your dashboard for static blog posts
   - Link to your live dashboard for interactive access
   - Consider creating a dedicated blog post explaining your running data

## Mobile Access

For optimal mobile experience:

1. **Add to Home Screen**
   - On iOS: Open in Safari → Share button → Add to Home Screen
   - On Android: Open in Chrome → Menu → Add to Home Screen
   - This creates an app-like experience without needing to download an app

2. **Mobile Optimization**
   - The dashboard is designed to be responsive
   - Rotate your device to landscape mode for better chart viewing
   - Use pinch-to-zoom for detailed chart inspection

## Maintaining Access

To ensure continued access:

1. **Keep Strava Connection Active**
   - Periodically log in to maintain your Strava API connection
   - If you change your Strava password, you may need to reconnect

2. **Check for Updates**
   - Periodically check for dashboard updates if you've implemented version notifications
   - Update your bookmark if the URL changes

3. **Troubleshooting Access Issues**
   - Clear browser cache and cookies if you experience login issues
   - Check your internet connection if the dashboard fails to load
   - Refer to the Verification Guide for additional troubleshooting steps

## Privacy Considerations

When sharing your dashboard:

1. **Data Privacy**
   - Your running data is only visible to users you explicitly share with
   - Consider what metrics you're comfortable sharing publicly
   - Review Strava's privacy settings to control what data is accessible via API

2. **Location Privacy**
   - Be mindful of sharing routes that reveal your home location
   - Consider enabling Strava's Privacy Zones if showing maps
   - You can configure the dashboard to hide sensitive location data

## Getting Help

If you encounter access issues:

1. **Documentation**
   - Refer to the Verification Guide for troubleshooting steps
   - Check the Deployment Guide for configuration issues

2. **Support Channels**
   - GitHub Issues (if you've made your repository public)
   - Vercel Support for hosting-related issues
   - Strava Developer Forum for API-related questions
