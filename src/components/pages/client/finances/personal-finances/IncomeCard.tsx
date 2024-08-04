import { FC, useMemo, useState } from 'react';
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
import IncomeEditDialog from './IncomeEditDialog';
import { IncomeProps } from './PersonalFinances.types';

const calculateMonthlyIncome = (income: IncomeProps) => {
  switch (income.period) {
    case 'monthly':
      return income.amount;
    case 'weekly':
      return income.amount * 4;
    case 'yearly':
      return income.amount / 12;
    default:
      return 0;
  }
};

const IncomeCard: FC = () => {
  const [incomes, setIncomes] = useState<IncomeProps[]>([
    {
      amount: 3500,
      period: 'monthly',
    },
    {
      amount: 4000,
      period: 'monthly',
    },
    {
      amount: 15000,
      period: 'yearly',
    },
  ]);

  const [expanded, setExpanded] = useState(false);

  const handleFormSubmit = (data: IncomeProps[]) => {
    setIncomes(data);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const totalIncome = useMemo(
    () =>
      incomes.reduce((acc, income) => acc + calculateMonthlyIncome(income), 0),
    [incomes]
  );

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Incomes</Typography>
          <IncomeEditDialog data={incomes} onSubmit={handleFormSubmit} />
        </Grid>
        <Typography variant="h6">~${totalIncome.toFixed(2)}/month</Typography>
        <Collapse in={expanded}>
          <Box mt={2}>
            {incomes.map((income, index) => (
              <Box key={index}>
                <Typography variant="body2">
                  Amount: ${income.amount}
                </Typography>
                <Typography variant="body2">
                  Period:{' '}
                  {income.period.charAt(0).toUpperCase() +
                    income.period.slice(1)}
                </Typography>
                {index < incomes.length - 1 && <Divider sx={{ my: 2 }} />}
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

export default IncomeCard;
