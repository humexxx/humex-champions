import { z } from 'zod';

// F1 Validators
export const GetF1StandingsInput = z.object({
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .optional(),
  type: z.enum(['drivers', 'constructors']).optional().default('drivers'),
});

export type GetF1StandingsInput = z.infer<typeof GetF1StandingsInput>;

export const GetF1ScheduleInput = z.object({
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .optional(),
});

export type GetF1ScheduleInput = z.infer<typeof GetF1ScheduleInput>;

export const GetF1DriverInfoInput = z.object({
  driverCode: z.string().min(3).max(3),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .optional(),
});

export type GetF1DriverInfoInput = z.infer<typeof GetF1DriverInfoInput>;

export const GetF1DriverResultsInput = z.object({
  driverCode: z.string().min(3).max(3),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type GetF1DriverResultsInput = z.infer<typeof GetF1DriverResultsInput>;

// Soccer Validators
export const GetSoccerStandingsInput = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
  season: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Season must be in format YYYY-YYYY')
    .optional(),
});

export type GetSoccerStandingsInput = z.infer<typeof GetSoccerStandingsInput>;

export const GetSoccerTeamsInput = z.object({
  leagueName: z.string().min(1, 'League name is required'),
});

export type GetSoccerTeamsInput = z.infer<typeof GetSoccerTeamsInput>;

export const GetSoccerMatchesInput = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
  type: z.enum(['next', 'previous', 'date']),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD')
    .optional(),
  limit: z.number().int().min(1).max(50).optional().default(15),
});

export type GetSoccerMatchesInput = z.infer<typeof GetSoccerMatchesInput>;

export const GetSoccerTeamInfoInput = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
});

export type GetSoccerTeamInfoInput = z.infer<typeof GetSoccerTeamInfoInput>;

export const GetSoccerPlayersInput = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
});

export type GetSoccerPlayersInput = z.infer<typeof GetSoccerPlayersInput>;

export const GetSoccerPlayerInfoInput = z.object({
  playerId: z.string().min(1, 'Player ID is required'),
});

export type GetSoccerPlayerInfoInput = z.infer<typeof GetSoccerPlayerInfoInput>;

export const SearchSoccerInput = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['teams', 'players']),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type SearchSoccerInput = z.infer<typeof SearchSoccerInput>;

export const SearchSoccerTeamsInput = z.object({
  teamName: z.string().min(1, 'Team name is required'),
});

export type SearchSoccerTeamsInput = z.infer<typeof SearchSoccerTeamsInput>;

export const GetSoccerCombinedMatchesInput = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
});

export type GetSoccerCombinedMatchesInput = z.infer<
  typeof GetSoccerCombinedMatchesInput
>;

export const GetCombinedMatchesInput = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  leagues: z
    .array(z.string())
    .min(1, 'At least one league required')
    .max(10, 'Maximum 10 leagues allowed')
    .optional(),
});

export type GetCombinedMatchesInput = z.infer<typeof GetCombinedMatchesInput>;
