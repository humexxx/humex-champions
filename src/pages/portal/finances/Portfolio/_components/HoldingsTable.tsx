import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { formatCurrency, formatPercentage } from 'src/utils';
import { IPortfolioTransaction } from '@shared/models/finances';
import React, { useState, useMemo, useCallback } from 'react';

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
  transactions?: IPortfolioTransaction[];
}

const HoldingsTable = ({ holdings, transactions = [] }: HoldingsTableProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Memoize transaction lookup for performance
  const transactionsByAsset = useMemo(() => {
    const map = new Map<string, IPortfolioTransaction[]>();
    transactions.forEach((tx) => {
      if (!map.has(tx.assetId)) {
        map.set(tx.assetId, []);
      }
      map.get(tx.assetId)!.push(tx);
    });
    return map;
  }, [transactions]);

  // Helper function to get transactions for a specific asset
  const getTransactionsForAsset = useCallback(
    (assetId: string) => {
      return transactionsByAsset.get(assetId) || [];
    },
    [transactionsByAsset]
  );

  const toggleRow = useCallback((symbol: string) => {
    // If the same row is clicked, close it. Otherwise, open the new one (closing any previously opened)
    setExpandedRow((prev) => (prev === symbol ? null : symbol));
  }, []);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>SYMBOL</TableCell>
            <TableCell align="right">PRICE</TableCell>
            <TableCell align="right">QTY</TableCell>
            <TableCell align="right">DAY P&L</TableCell>
            <TableCell align="right">VALUE</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((holding) => {
            const assetTransactions = getTransactionsForAsset(holding.symbol);
            const isExpanded = expandedRow === holding.symbol;

            return (
              <React.Fragment key={holding.symbol}>
                {/* Main holding row */}
                <TableRow
                  hover
                  onClick={() => toggleRow(holding.symbol)}
                  sx={{ cursor: 'pointer' }}
                >
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
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
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
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        toggleRow(holding.symbol);
                      }}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* Expandable transaction details row */}
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                  >
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box
                        sx={{
                          margin: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          padding: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        {assetTransactions.length > 0 ? (
                          <>
                            <Typography
                              variant="h6"
                              sx={{ mb: 2, color: 'text.secondary' }}
                            >
                              Transaction History
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>DATE</TableCell>
                                  <TableCell align="right">PRICE</TableCell>
                                  <TableCell align="right">QTY</TableCell>
                                  <TableCell align="right">P&L</TableCell>
                                  <TableCell align="right">VALUE</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {assetTransactions.map((transaction, index) => (
                                  <TableRow key={transaction.id || index}>
                                    <TableCell>
                                      {transaction.executedAt.toLocaleDateString(
                                        'en-US'
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(transaction.price)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {transaction.quantity}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        sx={{
                                          color: 'success.main',
                                          fontWeight: 500,
                                        }}
                                      >
                                        +
                                        {formatCurrency(
                                          (holding.price - transaction.price) *
                                            transaction.quantity
                                        )}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(
                                        holding.price * transaction.quantity
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        label="🏷️"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <Box
                              sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ cursor: 'pointer' }}
                              >
                                + Add Purchase
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <Typography color="text.secondary">
                            No transactions recorded for this asset
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HoldingsTable;
