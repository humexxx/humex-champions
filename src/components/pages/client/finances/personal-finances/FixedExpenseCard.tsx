import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
} from '@mui/material';
import { FixedExpenseProps, FixedExpenseEditDialog } from '.';

const FixedExpenseCard: React.FC = () => {
  const [expenses, setExpenses] = useState<FixedExpenseProps[]>([
    {
      amount: 0,
      expenseType: 'primary',
    },
  ]);

  const handleFormSubmit = (data: FixedExpenseProps[]) => {
    setExpenses(data);
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} direction="column">
          {expenses.map((expense, index) => (
            <Grid item key={index}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Typography variant="h6">
                    Amount: ${expense.amount}
                  </Typography>
                  <Typography variant="body2">
                    Type:{' '}
                    {expense.expenseType.charAt(0).toUpperCase() +
                      expense.expenseType.slice(1)}
                  </Typography>
                </Grid>
                <Grid item>
                  {/* Optionally, add a button to edit this expense */}
                </Grid>
              </Grid>
              {index < expenses.length - 1 && <Divider sx={{ my: 2 }} />}
            </Grid>
          ))}
          <Box mt={2}>
            <FixedExpenseEditDialog
              onSubmit={handleFormSubmit}
              data={expenses}
            />
          </Box>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FixedExpenseCard;
