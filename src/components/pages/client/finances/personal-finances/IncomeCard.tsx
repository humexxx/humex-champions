import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { IncomeProps, IncomeEditDialog } from '.';

const IncomeCard: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeProps[]>([
    {
      amount: 0,
      period: 'monthly',
    },
  ]);

  const handleFormSubmit = (data: IncomeProps[]) => {
    setIncomes(data);
  };

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">{incomes[0].period} Income</Typography>
            <Typography variant="h6">${incomes[0].amount}</Typography>
          </Grid>
          <Grid item>
            <IncomeEditDialog onSubmit={handleFormSubmit} data={[...incomes]} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default IncomeCard;
