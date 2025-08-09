import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { formatCurrency, formatPercentage } from 'src/utils';

interface Holding {
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  dailyChange: number;
  dailyChangePercentage: number;
  value: number;
}

interface HoldingsTableProps {
  holdings: Holding[];
}

const HoldingsTable = ({ holdings }: HoldingsTableProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>SYMBOL NAME</TableCell>
            <TableCell align="right">PRICE</TableCell>
            <TableCell align="right">QUANTITY</TableCell>
            <TableCell align="right">DAILY GAIN</TableCell>
            <TableCell align="right">VALUE</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={holding.symbol} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={holding.symbol}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography>{holding.name}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(holding.price)}
              </TableCell>
              <TableCell align="right">
                {holding.quantity.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        holding.dailyChange >= 0
                          ? 'success.main'
                          : 'error.main',
                      fontWeight: 500,
                    }}
                  >
                    {holding.dailyChange >= 0 ? '+' : ''}
                    {formatCurrency(holding.dailyChange)}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {holding.dailyChange >= 0 ? (
                      <TrendingUp
                        sx={{ fontSize: 14, color: 'success.main' }}
                      />
                    ) : (
                      <TrendingDown
                        sx={{ fontSize: 14, color: 'error.main' }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          holding.dailyChange >= 0
                            ? 'success.main'
                            : 'error.main',
                      }}
                    >
                      {formatPercentage(
                        Math.abs(holding.dailyChangePercentage)
                      )}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={500}>
                  {formatCurrency(holding.value)}
                </Typography>
              </TableCell>
              <TableCell>
                <IconButton size="small">
                  <KeyboardArrowDown />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HoldingsTable;
