import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { IPortfolioTransaction } from '@shared/types/finances';
import { formatCurrency } from 'src/utils';

interface ActivityTableProps {
  transactions: IPortfolioTransaction[];
}

const ActivityTable = ({ transactions }: ActivityTableProps) => {
  if (transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No recent activity</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell> </TableCell>
            <TableCell>TRANSACTION DETAILS</TableCell>
            <TableCell align="right">TOTAL AMOUNT</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow
              key={transaction.id || index}
              hover
              sx={{ '&:last-child td': { border: 0 } }}
            >
              {/* Columna 1: Icono */}
              <TableCell sx={{ width: 'auto', pr: 2 }}>
                <Chip
                  label={transaction.type}
                  size="small"
                  color={transaction.type === 'buy' ? 'success' : 'error'}
                  variant="outlined"
                />
              </TableCell>

              {/* Columna 2: Detalles */}
              <TableCell
                sx={{
                  flex: 1,
                  width: '100%',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.type === 'buy' ? 'Bought' : 'Sold'}{' '}
                    {transaction.quantity} {transaction.assetId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.executedAt.format('MMM D, YYYY')}
                  </Typography>
                </Box>
              </TableCell>

              {/* Columna 3: Monto total (flex: 1) */}
              <TableCell
                align="right"
                sx={{
                  width: 'auto',
                  minWidth: '150px',
                }}
              >
                <Typography variant="subtitle1">
                  {formatCurrency(
                    transaction.purchasePrice ??
                      transaction.quantity * transaction.purchasePrice
                  )}
                </Typography>
                {transaction.gainLoss !== undefined && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        transaction.gainLoss >= 0
                          ? 'success.main'
                          : 'error.main',
                      display: 'block',
                    }}
                  >
                    {transaction.gainLoss >= 0 ? '+' : ''}
                    {formatCurrency(transaction.gainLoss)}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default ActivityTable;
