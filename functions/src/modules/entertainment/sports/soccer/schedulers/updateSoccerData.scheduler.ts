import { onSchedule } from 'firebase-functions/v2/scheduler';

import { log } from '../../../../../core/logger';
import { getSoccerStandings } from '../soccer.service';

export const updateSoccerDataScheduler = onSchedule(
  {
    schedule: 'every 12 hours',
    timeZone: 'America/New_York',
    region: 'us-central1',
  },
  async () => {
    try {
      log.info('Starting soccer data update scheduler');

      // Update standings for major leagues
      const majorLeagues = [
        'Premier League',
        'La Liga',
        'Serie A',
        'Bundesliga',
        'Ligue 1',
      ];

      for (const league of majorLeagues) {
        try {
          await getSoccerStandings(league);
          log.info(`Updated standings for ${league}`);
        } catch (error) {
          log.warn(`Failed to update ${league} standings`, {
            league,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      log.info('Soccer data update completed successfully');
    } catch (error) {
      log.error('Failed to update soccer data', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);
