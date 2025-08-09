import { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import { Grid, IconButton } from '@mui/material';
import { CurrencyField, PercentageField } from 'src/components/forms';
import { forceNumberOnInputChange } from 'src/utils';

import { DataSet } from '../Page';

interface Props {
  onChange: (data: DataSet) => void;
  customData?: DataSet;
  onRemove?: () => void;
}

const Inputs = ({ onChange, customData, onRemove }: Props) => {
  const [initialInvestment, setInitialInvestment] = useState(
    customData ? customData.initialInvestment : 1000
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    customData ? customData.monthlyContribution : 500
  );
  const [interestRate, setInterestRate] = useState(
    customData ? customData.interestRate : 12
  );

  useEffect(() => {
    onChange({
      initialInvestment,
      monthlyContribution,
      interestRate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInvestment, monthlyContribution, interestRate]);

  return (
    <Grid container spacing={2}>
      <Grid item>
        <CurrencyField
          label="Initial Investment"
          value={initialInvestment}
          onChange={forceNumberOnInputChange(setInitialInvestment)}
        />
      </Grid>
      <Grid item>
        <CurrencyField
          label="Monthly Contribution"
          value={monthlyContribution}
          onChange={forceNumberOnInputChange(setMonthlyContribution)}
        />
      </Grid>
      <Grid item>
        <PercentageField
          label="Interest Rate"
          value={interestRate}
          onChange={forceNumberOnInputChange(setInterestRate)}
        />
      </Grid>
      {Boolean(onRemove) && (
        <Grid item justifyContent="center" display="flex">
          <IconButton onClick={onRemove}>
            <DeleteIcon color="error" />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
};

export default Inputs;
