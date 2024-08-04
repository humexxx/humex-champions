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
import FixedExpenseEditDialog from './FixedExpenseEditDialog';
import { FixedExpenseProps } from './PersonalFinances.types';

const FixedExpenseCard: React.FC = () => {
  const [expenses, setExpenses] = useState<FixedExpenseProps[]>([
    {
      amount: 1200,
      expenseType: 'primary',
    },
    {
      amount: 300,
      expenseType: 'secondary',
    },
    {
      amount: 600,
      expenseType: 'primary',
    },
  ]);

  const [expanded, setExpanded] = useState(false);

  const handleFormSubmit = (data: FixedExpenseProps[]) => {
    setExpenses(data);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const totalExpense = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Fixed Expenses</Typography>
          <FixedExpenseEditDialog data={expenses} onSubmit={handleFormSubmit} />
        </Grid>
        <Typography variant="h6">${totalExpense}</Typography>
        <Collapse in={expanded}>
          <Box mt={2}>
            {expenses.map((expense, index) => (
              <Box key={index}>
                <Typography variant="body2">
                  Amount: ${expense.amount}
                </Typography>
                <Typography variant="body2">
                  Type:{' '}
                  {expense.expenseType.charAt(0).toUpperCase() +
                    expense.expenseType.slice(1)}
                </Typography>
                {index < expenses.length - 1 && <Divider sx={{ my: 2 }} />}
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

export default FixedExpenseCard;
