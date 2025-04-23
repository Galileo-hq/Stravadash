import { refreshStravaToken } from '@/token-refresh';

/**
 * API client for Strava
 * Handles authentication and provides methods for fetching data
 */
export class StravaApiClient {
  private baseUrl = 'https://www.strava.com/api/v3';
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;

  constructor(accessToken: string, refreshToken: string, expiresAt: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
  }

  /**
   * Check if the current token is expired and refresh if needed
   */
  private async ensureValidToken() {
    const now = Math.floor(Date.now() / 1000);
    
    // If token is expired or about to expire in the next 10 minutes
    if (this.expiresAt < now + 600) {
      const result = await refreshStravaToken(this.refreshToken);
      this.accessToken = result.access_token;
      this.refreshToken = result.refresh_token;
      this.expiresAt = result.expires_at;
    }
  }

  /**
   * Make an authenticated request to the Strava API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureValidToken();
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Strava API error: ${response.status} ${response.statusText} ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Get athlete profile
   */
  async getAthlete() {
    return this.request('/athlete');
  }

  /**
   * Get athlete activities with pagination
   * @param params Query parameters for filtering activities
   */
  async getActivities(params: {
    before?: number;
    after?: number;
    page?: number;
    per_page?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.before) queryParams.append('before', params.before.toString());
    if (params.after) queryParams.append('after', params.after.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/athlete/activities${queryString}`);
  }

  /**
   * Get detailed activity data
   * @param activityId The ID of the activity to fetch
   */
  async getActivity(activityId: string) {
    return this.request(`/activities/${activityId}`);
  }

  /**
   * Get activity zones (heart rate, power, etc.)
   * @param activityId The ID of the activity to fetch zones for
   */
  async getActivityZones(activityId: string) {
    return this.request(`/activities/${activityId}/zones`);
  }

  /**
   * Get activity laps
   * @param activityId The ID of the activity to fetch laps for
   */
  async getActivityLaps(activityId: string) {
    return this.request(`/activities/${activityId}/laps`);
  }
}
