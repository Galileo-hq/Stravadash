# Vercel Deployment Guide for Strava Dashboard

This guide provides step-by-step instructions for deploying your Strava running data dashboard to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
3. Your Strava API credentials (Client ID and Client Secret)

## Deployment Steps

### 1. Push your code to GitHub

First, create a new GitHub repository and push your code:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/strava-dashboard.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Click "Add New..." and select "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: app (if your code is in the app directory)
   - Build Command: (leave as default)
   - Output Directory: (leave as default)

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

- `STRAVA_CLIENT_ID`: Your Strava API Client ID
- `STRAVA_CLIENT_SECRET`: Your Strava API Client Secret
- `NEXTAUTH_SECRET`: A random string for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., https://your-app.vercel.app)

### 4. Update Strava API Settings

1. Go to [Strava API settings](https://www.strava.com/settings/api)
2. Update the "Authorization Callback Domain" to your Vercel domain (e.g., your-app.vercel.app)

### 5. Deploy

Click "Deploy" and wait for the build to complete. Vercel will automatically build and deploy your application.

## Accessing Your Dashboard

Once deployed, your dashboard will be available at:
- https://your-app.vercel.app

## Troubleshooting

If you encounter any issues:

1. Check the build logs in Vercel for errors
2. Verify that all environment variables are correctly set
3. Ensure your Strava API callback domain is correctly configured
4. Check that your Strava API application has the necessary permissions

## Updating Your Dashboard

Any changes pushed to your GitHub repository will automatically trigger a new deployment on Vercel.
