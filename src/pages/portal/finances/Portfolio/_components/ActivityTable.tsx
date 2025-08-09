import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { formatCurrency } from 'src/utils';

interface Activity {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  price: number;
  date: string;
  total: number;
}

interface ActivityTableProps {
  activities: Activity[];
}

const ActivityTable = ({ activities }: ActivityTableProps) => {
  if (activities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No recent activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your portfolio activity will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>TYPE</TableCell>
            <TableCell>SYMBOL</TableCell>
            <TableCell align="right">QUANTITY</TableCell>
            <TableCell align="right">PRICE</TableCell>
            <TableCell align="right">TOTAL</TableCell>
            <TableCell align="right">DATE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id} hover>
              <TableCell>
                <Chip
                  label={activity.type.toUpperCase()}
                  size="small"
                  color={activity.type === 'buy' ? 'success' : 'error'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>{activity.symbol}</Typography>
              </TableCell>
              <TableCell align="right">
                {activity.quantity.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(activity.price)}
              </TableCell>
              <TableCell align="right">
                <Typography
                  sx={{
                    color:
                      activity.type === 'buy' ? 'error.main' : 'success.main',
                    fontWeight: 500,
                  }}
                >
                  {activity.type === 'buy' ? '-' : '+'}
                  {formatCurrency(activity.total)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">
                  {activity.date}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActivityTable;
