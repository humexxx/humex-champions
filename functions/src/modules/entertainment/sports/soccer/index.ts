// Soccer HTTP Callables
export { getSoccerCombinedMatchesCallable } from './http/getSoccerCombinedMatches.callable';
export { getSoccerMatchesByDateCallable } from './http/getSoccerMatchesByDate.callable';
export { getSoccerNextMatchesCallable } from './http/getSoccerNextMatches.callable';
export { getSoccerPlayerInfoCallable } from './http/getSoccerPlayerInfo.callable';
export { getSoccerPlayersCallable } from './http/getSoccerPlayers.callable';
export { getSoccerPreviousMatchesCallable } from './http/getSoccerPreviousMatches.callable';
export { getSoccerStandingsCallable } from './http/getSoccerStandings.callable';
export { getSoccerTeamInfoCallable } from './http/getSoccerTeamInfo.callable';
export { getSoccerTeamsCallable } from './http/getSoccerTeams.callable';
export { searchSoccerCallable } from './http/searchSoccer.callable';
export { searchSoccerTeamsCallable } from './http/searchSoccerTeams.callable';

// Soccer Schedulers
export { updateSoccerDataScheduler } from './schedulers/updateSoccerData.scheduler';

// Soccer Services
export * from './soccer.service';
