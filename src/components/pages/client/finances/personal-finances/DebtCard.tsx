import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  IconButton,
  Box,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DebtEditDialog from './DebtEditDialog';
import { DebtProps } from './PersonalFinances.types';

const DebtCard: React.FC = () => {
  const [debts, setDebts] = useState<DebtProps[]>([
    {
      pendingDebt: 25000,
      minimumPayment: 500,
      annualInterest: 5,
    },
    {
      pendingDebt: 15000,
      minimumPayment: 300,
      annualInterest: 3.5,
    },
    {
      pendingDebt: 10000,
      minimumPayment: 200,
      annualInterest: 4.2,
    },
  ]);

  const [expanded, setExpanded] = useState(false);

  const handleFormSubmit = (data: DebtProps[]) => {
    setDebts(data);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const totalDebt = debts.reduce((acc, debt) => acc + debt.pendingDebt, 0);

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Debts</Typography>
          <DebtEditDialog data={debts} onSubmit={handleFormSubmit} />
        </Grid>
        <Typography variant="h6">${totalDebt}</Typography>
        <Collapse in={expanded}>
          <Box mt={2}>
            {debts.map((debt, index) => (
              <Box key={index}>
                <Typography variant="body2">
                  Debt: ${debt.pendingDebt}
                </Typography>
                <Typography variant="body2">
                  Minimum Payment: ${debt.minimumPayment}
                </Typography>
                <Typography variant="body2">
                  Interest: {debt.annualInterest}%
                </Typography>
                {index < debts.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </Box>
        </Collapse>
        <Grid container justifyContent="flex-end">
          <IconButton onClick={handleExpandClick}>
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          </IconButton>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DebtCard;
