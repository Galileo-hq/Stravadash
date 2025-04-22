# Vercel Domain and Settings Configuration Guide

This guide provides instructions for configuring domains and optimizing settings for your Strava dashboard on Vercel.

## Custom Domain Configuration

### Adding a Custom Domain

1. Log in to your Vercel account and select your Strava dashboard project
2. Navigate to the "Settings" tab
3. Select "Domains" from the left sidebar
4. Click "Add" to add a new domain
5. Enter your domain name (e.g., strava-dashboard.yourdomain.com)
6. Follow Vercel's instructions to verify domain ownership:
   - For domains managed through common DNS providers, you can use the automatic setup
   - For manually configured domains, you'll need to add the provided DNS records

### DNS Configuration Options

#### Option 1: Using Vercel DNS (Recommended)
1. Transfer your domain to Vercel DNS for automatic configuration
2. In your project settings, select "Domains" → "Transfer in"
3. Follow the prompts to complete the transfer

#### Option 2: External DNS Provider
Add these records to your DNS configuration:
- An A record pointing to 76.76.21.21
- A CNAME record for the www subdomain pointing to cname.vercel-dns.com

## Environment Variables

Configure these environment variables in your Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:
   - `STRAVA_CLIENT_ID`: Your Strava API Client ID
   - `STRAVA_CLIENT_SECRET`: Your Strava API Client Secret
   - `NEXTAUTH_SECRET`: A random string for NextAuth security
   - `NEXTAUTH_URL`: Your deployment URL (custom domain if configured)

## Performance Optimization

### Edge Network Configuration
1. Go to "Settings" → "Edge Network"
2. Enable "Edge Caching" for static assets
3. Configure cache control headers as needed

### Image Optimization
1. Go to "Settings" → "Image Optimization"
2. Enable "Image Optimization" for better performance
3. Configure image quality and formats based on your needs

## Security Settings

### Headers Configuration
1. Create a `vercel.json` file in your project root (if not already present)
2. Add security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://www.strava.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### Authentication Settings
1. Go to "Settings" → "Environment Variables"
2. Ensure `NEXTAUTH_SECRET` is set to a strong random value
3. Update your Strava API application settings to include your custom domain

## Analytics and Monitoring

### Vercel Analytics
1. Go to "Analytics" in your project dashboard
2. Enable "Web Vitals" to monitor performance
3. Enable "Audiences" to understand user behavior

### Error Monitoring
1. Go to "Settings" → "Integrations"
2. Connect an error monitoring service like Sentry or LogRocket

## Deployment Protection

### Password Protection (Optional)
1. Go to "Settings" → "Deployment Protection"
2. Enable "Password Protection" for staging environments
3. Configure access credentials

## Automatic Updates

### GitHub Integration
1. Ensure your repository is connected to Vercel
2. Each push to the main branch will trigger automatic deployment
3. Configure branch deployments for preview environments

## Troubleshooting

If you encounter issues with your deployment:

1. Check the "Deployments" tab for build logs
2. Verify environment variables are correctly set
3. Ensure your Strava API credentials are valid
4. Check that your domain DNS settings are properly configured

For additional help, refer to [Vercel's documentation](https://vercel.com/docs) or contact their support team.
