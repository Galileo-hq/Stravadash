# Strava Dashboard UI Wireframes

## Main Dashboard View

```
+-------------------------------------------------------+
|                   STRAVA DASHBOARD                    |
+-------------------------------------------------------+
| [Metric Selector ▼] [Time Period Selector ▼] [Refresh]|
+-------------------------------------------------------+
|                                                       |
|                                                       |
|                                                       |
|                  CHART DISPLAY AREA                   |
|                                                       |
|                                                       |
|                                                       |
+-------------------------------------------------------+
|                  SUMMARY STATISTICS                   |
| Total Distance: xxx | Avg Pace: xxx | Elevation: xxx |
+-------------------------------------------------------+
|                    ACTIVITY LIST                      |
| Date | Distance | Time | Pace | HR | Elevation | ... |
+-------------------------------------------------------+
```

## Metric Selector Component
```
+------------------------+
| Select Metric          |
+------------------------+
| ○ Distance (miles)     |
| ○ Pace (min/mile)      |
| ○ Heart Rate (bpm)     |
| ○ Elevation (ft)       |
| ○ Cadence (spm)        |
| ○ Power (watts)        |
+------------------------+
```

## Time Period Selector Component
```
+------------------------+
| Select Time Period     |
+------------------------+
| ○ Single Run           |
| ○ Week                 |
| ○ Month                |
| ○ Three Months         |
| ○ Year                 |
| ○ Two Years            |
| ○ Three Years          |
| ○ All Time             |
+------------------------+
| Custom Range:          |
| [Start Date] [End Date]|
+------------------------+
```

## Chart Display Area (Example: Weekly Distance)
```
+-------------------------------------------------------+
|  Weekly Running Distance (miles)                      |
|                                                       |
|    ^                                                  |
|    |                                                  |
|    |                 *                                |
|    |                * *        *                      |
|    |       *       *   *      * *                     |
|    |      * *     *     *    *   *    *               |
|    |     *   *   *       *  *     *  * *              |
|    +------------------------------------------------->|
|      Week1  Week2  Week3  Week4  Week5  Week6  Week7  |
+-------------------------------------------------------+
```

## Activity Details View
```
+-------------------------------------------------------+
|                 ACTIVITY DETAILS                      |
+-------------------------------------------------------+
| Run on April 15, 2025 - "Morning Run"                 |
+-------------------------------------------------------+
|                                                       |
| Distance: 5.2 miles       Duration: 42:15             |
| Pace: 8:07 min/mile       Elevation Gain: 328 ft      |
| Avg Heart Rate: 152 bpm   Max Heart Rate: 175 bpm     |
| Avg Cadence: 172 spm      Avg Power: 285 watts        |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|                 PACE/ELEVATION CHART                  |
|                                                       |
+-------------------------------------------------------+
|                                                       |
|                 HEART RATE CHART                      |
|                                                       |
+-------------------------------------------------------+
```

## Settings Panel
```
+-------------------------------------------------------+
|                     SETTINGS                          |
+-------------------------------------------------------+
| Units:                                                |
| ○ Miles            ○ Kilometers                       |
|                                                       |
| Default View:                                         |
| [Metric Selector ▼]  [Time Period Selector ▼]         |
|                                                       |
| Chart Colors:                                         |
| Distance: [Color Picker]  Pace: [Color Picker]        |
| Heart Rate: [Color Picker] Elevation: [Color Picker]  |
| Cadence: [Color Picker]    Power: [Color Picker]      |
|                                                       |
| Data Refresh:                                         |
| ○ Automatic (every 30 min)  ○ Manual only             |
|                                                       |
| [Save Settings]                                       |
+-------------------------------------------------------+
```

## Authentication Flow
```
+-------------------------------------------------------+
|                 STRAVA DASHBOARD                      |
+-------------------------------------------------------+
|                                                       |
|                                                       |
|   To view your running data, please connect your      |
|   Strava account.                                     |
|                                                       |
|   [Connect with Strava]                               |
|                                                       |
|                                                       |
+-------------------------------------------------------+
```

## Mobile View (Responsive Design)
```
+----------------------+
|   STRAVA DASHBOARD   |
+----------------------+
| [Metric ▼] [Time ▼]  |
+----------------------+
|                      |
|                      |
|    CHART DISPLAY     |
|                      |
|                      |
+----------------------+
| SUMMARY STATISTICS   |
| Distance: xxx        |
| Pace: xxx            |
| Elevation: xxx       |
+----------------------+
| ACTIVITY LIST        |
| (Scrollable)         |
+----------------------+
```
