import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import { useState } from 'react';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  code: string;
  displayName: string;
  shortName: string;
}

interface Constructor {
  id: string;
  name: string;
  displayName?: string;
  abbreviation?: string;
  nationality: string;
  color?: string;
}

interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driver: Driver;
  constructor: Constructor;
}

interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructor: Constructor;
}

interface StandingsTableProps {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
}

const StandingsTable = ({ drivers, constructors }: StandingsTableProps) => {
  const [selectedStanding, setSelectedStanding] = useState('drivers');

  const getFlagEmoji = (nationality: string) => {
    const flags: { [key: string]: string } = {
      Australia: '🇦🇺',
      Britain: '🇬🇧',
      Netherlands: '🇳🇱',
      Monaco: '🇲🇨',
      Italy: '🇮🇹',
      Thailand: '🇹🇭',
      Germany: '🇩🇪',
      France: '🇫🇷',
      Spain: '🇪🇸',
      Canada: '🇨🇦',
      'New Zealand': '🇳🇿',
      Brazil: '🇧🇷',
      Japan: '🇯🇵',
      Argentina: '🇦🇷',
    };
    return flags[nationality] || '🏁';
  };

  const DriversTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Pos</strong>
            </TableCell>
            <TableCell>
              <strong>Driver</strong>
            </TableCell>
            <TableCell>
              <strong>Code</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Points</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Wins</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((standing) => (
            <TableRow key={standing.driver.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h6"
                    color={standing.position <= 3 ? 'primary' : 'text.primary'}
                  >
                    {standing.position}
                  </Typography>
                  {standing.position === 1 && <span>🥇</span>}
                  {standing.position === 2 && <span>🥈</span>}
                  {standing.position === 3 && <span>🥉</span>}
                </Box>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {standing.driver.code}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {standing.driver.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFlagEmoji(standing.driver.nationality)}{' '}
                      {standing.driver.nationality}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  label={standing.driver.code}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="h6"
                  color={standing.points > 0 ? 'primary' : 'text.secondary'}
                >
                  {standing.points}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{standing.wins}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const ConstructorsTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Pos</strong>
            </TableCell>
            <TableCell>
              <strong>Constructor</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Points</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Wins</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {constructors.map((standing) => (
            <TableRow key={standing.constructor.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="h6"
                    color={standing.position <= 3 ? 'primary' : 'text.primary'}
                  >
                    {standing.position}
                  </Typography>
                  {standing.position === 1 && <span>🥇</span>}
                  {standing.position === 2 && <span>🥈</span>}
                  {standing.position === 3 && <span>🥉</span>}
                </Box>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: standing.constructor.color
                        ? `#${standing.constructor.color}`
                        : '#gray',
                      borderRadius: 1,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {standing.constructor.displayName ||
                        standing.constructor.name}
                    </Typography>
                    {standing.constructor.abbreviation && (
                      <Typography variant="caption" color="text.secondary">
                        {standing.constructor.abbreviation}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="h6"
                  color={standing.points > 0 ? 'primary' : 'text.secondary'}
                >
                  {standing.points}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{standing.wins}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Championship Standings
      </Typography>

      {/* Standings Type Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={selectedStanding}
          onChange={(_, value) => setSelectedStanding(value)}
        >
          <Tab
            value="drivers"
            label={`Drivers Championship (${drivers.length})`}
          />
          <Tab
            value="constructors"
            label={`Constructors Championship (${constructors.length})`}
          />
        </Tabs>
      </Box>

      {selectedStanding === 'drivers' ? (
        <DriversTable />
      ) : (
        <ConstructorsTable />
      )}
    </Paper>
  );
};

export default StandingsTable;
