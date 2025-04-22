# Deployment Guide for Strava Running Dashboard

This guide provides instructions for deploying your Strava Running Dashboard to a production environment.

## Prerequisites

Before deploying, ensure you have:
1. A Strava API application set up (see STRAVA_API_SETUP.md)
2. Your environment variables ready (.env.local for development)
3. Tested the application locally

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest platform for deploying Next.js applications.

### Steps:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one

2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. From your project directory, run:
   ```
   vercel login
   vercel
   ```

4. Follow the prompts to deploy your application

5. Set up environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to the "Environment Variables" tab
   - Add the same variables from your .env.local file:
     - STRAVA_CLIENT_ID
     - STRAVA_CLIENT_SECRET
     - NEXTAUTH_SECRET
     - NEXTAUTH_URL (set to your Vercel deployment URL)

6. Update your Strava API application:
   - Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
   - Update the "Authorization Callback Domain" to your Vercel domain (without https:// or path)

## Option 2: Deploy to Cloudflare Pages

Since our application is built with Next.js and configured for Cloudflare, this is another good option.

### Steps:

1. Create a Cloudflare account if you don't have one

2. Build your application:
   ```
   cd /path/to/strava_dashboard/app
   pnpm build
   ```

3. Use the deploy_apply_deployment tool with the "nextjs" type:
   ```
   deploy_apply_deployment --type nextjs --local_dir /path/to/strava_dashboard/app
   ```

4. Set up environment variables in the Cloudflare Pages dashboard:
   - Go to your project settings
   - Navigate to the "Environment variables" tab
   - Add the same variables from your .env.local file

5. Update your Strava API application with the new domain

## Option 3: Self-Hosting

If you prefer to self-host, you can build and run the application on your own server.

### Steps:

1. Build the application:
   ```
   cd /path/to/strava_dashboard/app
   pnpm build
   ```

2. Start the production server:
   ```
   pnpm start
   ```

3. For a more robust setup, consider using a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start npm --name "strava-dashboard" -- start
   ```

4. Set up a reverse proxy (like Nginx) to handle HTTPS and domain routing

## Post-Deployment Steps

After deploying:

1. Test the authentication flow on your production site
2. Verify that data is being fetched correctly
3. Check that all visualizations are working as expected
4. Test on different devices to ensure responsive design works

## Troubleshooting

If you encounter issues:

- Check that all environment variables are set correctly
- Verify that your Strava API application's callback domain is correct
- Look at the application logs for error messages
- Ensure your Strava API application has the necessary permissions

## Security Considerations

- Always use HTTPS in production
- Keep your environment variables secure
- Regularly rotate your NEXTAUTH_SECRET
- Monitor your Strava API usage to stay within rate limits
