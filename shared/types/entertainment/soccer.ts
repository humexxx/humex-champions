/**
 * Soccer/Football Models
 * Based on TheSportsDB API v1 structure
 */

export interface SoccerLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate?: string;
  intDivision?: string;
  idCup?: string;
  strCurrentSeason?: string;
  intFormedYear?: string;
  dateFirstEvent?: string;
  strGender?: string;
  strCountry?: string;
  strWebsite?: string;
  strFacebook?: string;
  strInstagram?: string;
  strTwitter?: string;
  strYoutube?: string;
  strRSS?: string;
  strDescriptionEN?: string;
  strBanner?: string;
  strBadge?: string;
  strLogo?: string;
  strPoster?: string;
  strTrophy?: string;
  strNaming?: string;
  strComplete?: string;
  strLocked?: string;
}

export interface SoccerTeam {
  idTeam: string;
  idSoccerXML?: string;
  idAPIfootball?: string;
  intLoved?: string;
  strTeam: string;
  strTeamShort?: string;
  strAlternate?: string;
  intFormedYear?: string;
  strSport: string;
  strLeague: string;
  idLeague: string;
  strDivision?: string;
  strManager?: string;
  strStadium?: string;
  strKeywords?: string;
  strRSS?: string;
  strStadiumThumb?: string;
  strStadiumDescription?: string;
  strStadiumLocation?: string;
  intStadiumCapacity?: string;
  strWebsite?: string;
  strFacebook?: string;
  strTwitter?: string;
  strInstagram?: string;
  strDescriptionEN?: string;
  strGender?: string;
  strCountry?: string;
  strTeamBadge?: string;
  strTeamJersey?: string;
  strTeamLogo?: string;
  strTeamFanart1?: string;
  strTeamFanart2?: string;
  strTeamFanart3?: string;
  strTeamFanart4?: string;
  strTeamBanner?: string;
  strYoutube?: string;
  strLocked?: string;
}

export interface SoccerPlayer {
  idPlayer: string;
  idTeam: string;
  idTeam2?: string;
  idTeamNational?: string;
  idSoccerXML?: string;
  idAPIfootball?: string;
  idPlayerManager?: string;
  strNationality: string;
  strPlayer: string;
  strTeam?: string;
  strTeam2?: string;
  strSport: string;
  intSoccerXMLTeamID?: string;
  dateBorn?: string;
  strNumber?: string;
  dateSigned?: string;
  strSigning?: string;
  strWage?: string;
  strOutfitter?: string;
  strKit?: string;
  strAgent?: string;
  strBirthLocation?: string;
  strDescriptionEN?: string;
  strGender?: string;
  strSide?: string;
  strPosition: string;
  strCollege?: string;
  strFacebook?: string;
  strWebsite?: string;
  strTwitter?: string;
  strInstagram?: string;
  strYoutube?: string;
  strHeight?: string;
  strWeight?: string;
  intLoved?: string;
  strThumb?: string;
  strCutout?: string;
  strRender?: string;
  strBanner?: string;
  strFanart1?: string;
  strFanart2?: string;
  strFanart3?: string;
  strFanart4?: string;
  strCreativeCommons?: string;
  strLocked?: string;
}

export interface SoccerMatch {
  idEvent: string;
  idSoccerXML?: string;
  idAPIfootball?: string;
  strEvent: string;
  strEventAlternate?: string;
  strFilename?: string;
  strSport: string;
  idLeague: string;
  strLeague: string;
  strSeason?: string;
  strDescriptionEN?: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
  intRound?: string;
  intSpectators?: string;
  strOfficial?: string;
  strTimestamp?: string;
  dateEvent: string;
  dateEventLocal?: string;
  strTime?: string;
  strTimeLocal?: string;
  strTVStation?: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strResult?: string;
  strVenue?: string;
  strCountry?: string;
  strCity?: string;
  strPoster?: string;
  strSquare?: string;
  strFanart?: string;
  strThumb?: string;
  strBanner?: string;
  strMap?: string;
  strTweet1?: string;
  strTweet2?: string;
  strTweet3?: string;
  strVideo?: string;
  strStatus?: string;
  strPostponed?: string;
  strLocked?: string;
}

export interface SoccerStanding {
  idStanding?: string;
  intRank: number;
  idTeam: string;
  strTeam: string;
  strTeamBadge?: string;
  idLeague: string;
  strLeague: string;
  strSeason: string;
  strForm?: string;
  strDescription?: string;
  intPlayed: number;
  intWin: number;
  intLoss: number;
  intDraw: number;
  intGoalsFor: number;
  intGoalsAgainst: number;
  intGoalDifference: number;
  intPoints: number;
  dateUpdated?: string;
}

export interface SoccerSeason {
  strSeason: string;
  idLeague: string;
  strLeague: string;
}

export interface SoccerVenue {
  idVenue: string;
  strVenue: string;
  strVenueAlternate?: string;
  strSport?: string;
  strDescriptionEN?: string;
  strCountry?: string;
  strLocation?: string;
  intCapacity?: string;
  strWebsite?: string;
  strFacebook?: string;
  strTwitter?: string;
  strInstagram?: string;
  strThumb?: string;
  strFanart1?: string;
  strFanart2?: string;
  strFanart3?: string;
  strFanart4?: string;
  strMap?: string;
}

/**
 * API Response wrapper types
 */
export interface SoccerTeamsResponse {
  teams: SoccerTeam[] | null;
}

export interface SoccerPlayersResponse {
  player: SoccerPlayer[] | null;
}

export interface SoccerMatchesResponse {
  events: SoccerMatch[] | null;
}

export interface SoccerStandingsResponse {
  table: SoccerStanding[] | null;
}

export interface SoccerLeaguesResponse {
  leagues: SoccerLeague[] | null;
}

export interface SoccerSeasonsResponse {
  seasons: SoccerSeason[] | null;
}

export interface SoccerVenuesResponse {
  venues: SoccerVenue[] | null;
}

/**
 * Frontend display models
 */
export interface SoccerLeagueDisplay {
  id: string;
  name: string;
  country: string;
  season: string;
  badge?: string;
  founded?: string;
  description?: string;
}

export interface SoccerTeamDisplay {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  league: string;
  manager?: string;
  stadium?: string;
  founded?: string;
  badge?: string;
  website?: string;
}

export interface SoccerPlayerDisplay {
  id: string;
  name: string;
  position: string;
  nationality: string;
  team?: string;
  number?: string;
  age?: number;
  height?: string;
  weight?: string;
  photo?: string;
}

export interface SoccerMatchDisplay {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time?: string;
  venue?: string;
  league: string;
  status?: string;
  round?: number;
}

export interface SoccerStandingDisplay {
  position: number;
  team: string;
  teamBadge?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}

/**
 * Popular Soccer League IDs for easy reference
 */
export const POPULAR_SOCCER_LEAGUES = {
  PREMIER_LEAGUE: '4328', // English Premier League
  LA_LIGA: '4335', // Spanish La Liga
  BUNDESLIGA: '4331', // German Bundesliga
  SERIE_A: '4332', // Italian Serie A
  LIGUE_1: '4334', // French Ligue 1
  CHAMPIONS_LEAGUE: '4480', // UEFA Champions League
  EUROPA_LEAGUE: '4481', // UEFA Europa League
  WORLD_CUP: '4451', // FIFA World Cup
  EUROS: '4450', // UEFA European Championship
  COPA_AMERICA: '4452', // Copa America
  MLS: '4346', // Major League Soccer
  BRAZILIAN_SERIE_A: '4351', // Brazilian Serie A
  ARGENTINE_PRIMERA: '4350', // Argentine Primera División
} as const;

/**
 * Common Soccer Positions
 */
export const SOCCER_POSITIONS = {
  GOALKEEPER: 'Goalkeeper',
  DEFENDER: 'Defender',
  MIDFIELDER: 'Midfielder',
  FORWARD: 'Forward',
  STRIKER: 'Striker',
  WINGER: 'Winger',
  CENTRE_BACK: 'Centre-Back',
  FULL_BACK: 'Full-back',
  WING_BACK: 'Wing-back',
  DEFENSIVE_MIDFIELDER: 'Defensive Midfielder',
  CENTRAL_MIDFIELDER: 'Central Midfielder',
  ATTACKING_MIDFIELDER: 'Attacking Midfielder',
} as const;
