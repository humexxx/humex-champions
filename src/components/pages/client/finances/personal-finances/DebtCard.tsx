import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { DebtEditDialog, DebtProps } from '.';

const DebtCard: React.FC = () => {
  const [debts, setDebts] = useState<DebtProps[]>([
    {
      pendingDebt: 0,
      minimumPayment: 0,
      annualInterest: 0,
    },
  ]);

  const handleFormSubmit = (data: DebtProps[]) => {
    setDebts(data);
  };

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">{debts[0].pendingDebt} Income</Typography>
            <Typography variant="h6">${debts[0].minimumPayment}</Typography>
          </Grid>
          <Grid item>
            <DebtEditDialog onSubmit={handleFormSubmit} data={[...debts]} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DebtCard;
