# Instructions for Setting Up Your Strava API Application

To connect your dashboard to the Strava API, you'll need to create a Strava API application and obtain credentials. Follow these steps:

## 1. Create a Strava API Application

1. Log in to your Strava account at [strava.com](https://www.strava.com/)
2. Navigate to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
3. Fill in the application details:
   - **Application Name**: Strava Running Dashboard (or any name you prefer)
   - **Category**: Choose "Training"
   - **Club**: Leave blank or select your club if applicable
   - **Website**: http://localhost:3000 (during development)
   - **Authorization Callback Domain**: localhost

4. Click "Create" to register your application

## 2. Get Your API Credentials

After creating your application, you'll see:
- **Client ID**: A number that identifies your application
- **Client Secret**: A string that serves as your application password

These credentials will be used in your `.env` file.

## 3. Set Up Environment Variables

1. Copy the `.env.template` file to a new file named `.env.local`:
   ```
   cp .env.template .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   - Replace `your_client_id_here` with your Strava Client ID
   - Replace `your_client_secret_here` with your Strava Client Secret
   - Generate a random string for `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32` in terminal)
   - Set `NEXTAUTH_URL` to your application URL (use `http://localhost:3000` for local development)

## 4. Start the Application

With your environment variables set up, you can now start the application:

```
cd /path/to/strava_dashboard/app
pnpm dev
```

The application will be available at http://localhost:3000

## 5. Authentication Flow

When you first access the dashboard, you'll be prompted to connect with Strava. This will:
1. Redirect you to Strava's authorization page
2. Ask you to grant permissions to the application
3. Redirect back to your dashboard with an authorization code
4. Exchange the code for access and refresh tokens
5. Use these tokens to fetch your running data

## 6. Permissions Required

The application requests these permissions from Strava:
- `read`: Basic access to read your profile information
- `activity:read`: Access to read your activities
- `activity:read_all`: Access to read all activities, including those with privacy zones

## 7. Security Considerations

- Keep your Client Secret and NEXTAUTH_SECRET confidential
- In production, use HTTPS for all communications
- Refresh tokens are stored securely and used to obtain new access tokens when needed
- The application never stores your Strava password
